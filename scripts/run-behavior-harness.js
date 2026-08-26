#!/usr/bin/env node
// Dependency-free behaviour-lock harness.
//
// Loads a test HTML page (default: counter.test.html) in a headless system
// Chrome/Chromium, drives it over the DevTools Protocol via
// `--remote-debugging-pipe` (fd 3 for commands in, fd 4 for responses/events
// out), runs the in-page assertion suite defined by the test page, then
// exercises a real page reload to confirm state does not persist across it.
//
// No npm dependency and no package.json are required to run this script —
// it only needs Node's built-in `child_process`/`fs` modules and a system
// Chrome/Chromium binary.
//
// Usage:
//   node scripts/run-behavior-harness.js [path/to/test.html]
//
// Chrome/Chromium discovery:
//   - CHROME_PATH env var, if set, is tried first.
//   - Otherwise a list of common Linux/macOS install locations is probed.
// If no usable binary is found, the script prints a diagnostic and exits
// with a non-zero status (per the harness's Definition of Done).

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const COMMON_CHROME_PATHS = [
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/local/bin/google-chrome',
  '/usr/local/bin/chromium',
  '/opt/google/chrome/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

function findChromeBinary() {
  const candidates = [process.env.CHROME_PATH, ...COMMON_CHROME_PATHS].filter(Boolean);
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {
      // ignore and keep looking
    }
  }
  return null;
}

// --- Minimal CDP-over-pipe client -----------------------------------------
//
// Chrome, launched with --remote-debugging-pipe, reads JSON commands
// (NUL-terminated) from fd 3 and writes JSON responses/events (also
// NUL-terminated) to fd 4. We request those as extra 'pipe' stdio slots and
// speak the protocol directly, with no CDP client package involved.

function createCdpClient(child) {
  const cmdOut = child.stdio[3]; // we write commands here (chrome reads fd 3)
  const evtIn = child.stdio[4]; // we read responses/events here (chrome writes fd 4)

  let buffer = Buffer.alloc(0);
  let nextId = 1;
  const pending = new Map();
  const eventListeners = [];

  evtIn.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    let nullIdx;
    while ((nullIdx = buffer.indexOf(0)) !== -1) {
      const raw = buffer.slice(0, nullIdx).toString('utf8');
      buffer = buffer.slice(nullIdx + 1);
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        continue;
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(`CDP error for id ${msg.id}: ${JSON.stringify(msg.error)}`));
        else resolve(msg);
      } else if (msg.method) {
        for (const fn of eventListeners) fn(msg);
      }
    }
  });

  const SEND_TIMEOUT_MS = 15000;

  function send(method, params, sessionId) {
    const id = nextId++;
    const payload = { id, method, params: params || {} };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP command "${method}" (id ${id}) timed out after ${SEND_TIMEOUT_MS}ms waiting for a response`));
      }, SEND_TIMEOUT_MS);
      pending.set(id, {
        resolve: (msg) => {
          clearTimeout(timer);
          resolve(msg);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      cmdOut.write(JSON.stringify(payload) + '\0');
    });
  }

  function onEvent(fn) {
    eventListeners.push(fn);
  }

  return { send, onEvent };
}

async function waitFor(predicate, { timeoutMs, intervalMs = 100, message }) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    let result;
    try {
      result = await predicate();
    } catch (err) {
      // A transient CDP error (e.g. during navigation/context teardown) is
      // treated as "not ready yet" and retried, same as a falsy result —
      // only a timeout should be a hard failure here.
      result = false;
    }
    if (result) return result;
    if (Date.now() >= deadline) {
      throw new Error(message || 'timed out waiting for condition');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

async function findPageTarget(cdp) {
  return waitFor(
    async () => {
      const targets = await cdp.send('Target.getTargets');
      return targets.result.targetInfos.find((t) => t.type === 'page');
    },
    { timeoutMs: 10000, message: 'no browser page target appeared' }
  );
}

async function waitForReady(cdp, sessionId) {
  await waitFor(
    async () => {
      const r = await cdp.send(
        'Runtime.evaluate',
        { expression: 'document.readyState', returnByValue: true },
        sessionId
      );
      return r.result && r.result.result && r.result.result.value === 'complete';
    },
    { timeoutMs: 10000, message: 'page never reached readyState complete' }
  );
}

async function evaluate(cdp, sessionId, expression) {
  const r = await cdp.send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId
  );
  if (r.result && r.result.exceptionDetails) {
    throw new Error(
      `page threw evaluating expression: ${JSON.stringify(r.result.exceptionDetails)}`
    );
  }
  return r.result.result ? r.result.result.value : undefined;
}

async function main() {
  const testFileArg = process.argv[2] || 'counter.test.html';
  const testFilePath = path.resolve(process.cwd(), testFileArg);

  if (!fs.existsSync(testFilePath)) {
    console.error(`FAIL: test file not found: ${testFilePath}`);
    process.exit(1);
  }

  const chromePath = findChromeBinary();
  if (!chromePath) {
    console.error(
      'FAIL: no system Chrome/Chromium binary found. Set CHROME_PATH to a ' +
        'Chrome/Chromium executable, or install Chrome/Chromium at one of the ' +
        'common locations this script probes.'
    );
    process.exit(1);
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'behavior-harness-'));
  let child;
  let exitCode = 1;

  try {
    // --no-sandbox disables Chrome's OS-level renderer sandbox, so it's
    // only added when actually needed: running as root (common in CI
    // containers, where the sandbox's user-namespace setup is otherwise
    // unavailable) leaves Chrome unable to start without it.
    const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;
    child = spawn(
      chromePath,
      [
        '--headless=new',
        '--disable-gpu',
        ...(isRoot ? ['--no-sandbox'] : []),
        '--remote-debugging-pipe',
        `--user-data-dir=${userDataDir}`,
        'about:blank',
      ],
      { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] }
    );

    const spawnError = await new Promise((resolve) => {
      child.once('error', (err) => resolve(err));
      setImmediate(() => resolve(null));
    });
    if (spawnError) {
      throw new Error(`could not launch browser binary "${chromePath}": ${spawnError.message}`);
    }

    const cdp = createCdpClient(child);

    const pageTarget = await findPageTarget(cdp);
    const attach = await cdp.send('Target.attachToTarget', {
      targetId: pageTarget.targetId,
      flatten: true,
    });
    const sessionId = attach.result.sessionId;

    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);

    const fileUrl = 'file://' + testFilePath;
    await cdp.send('Page.navigate', { url: fileUrl }, sessionId);
    await waitForReady(cdp, sessionId);

    const results = [];

    const suiteJson = await evaluate(
      cdp,
      sessionId,
      'JSON.stringify(window.__runBehaviorTests__())'
    );
    for (const r of JSON.parse(suiteJson)) results.push(r);

    // Reload-reset semantics (R-0003): mutate state, reload the page for
    // real, then confirm state and rendered DOM reset to their initial
    // values with no persistence mechanism involved.
    await evaluate(cdp, sessionId, 'dispatch(ACTION.ADD_FOUR); dispatch(ACTION.ADD_FOUR); undefined');
    await cdp.send('Page.reload', {}, sessionId);
    await waitForReady(cdp, sessionId);

    const afterReload = await evaluate(
      cdp,
      sessionId,
      'JSON.stringify({ c: c, cc: cc, d: document.getElementById("d").innerHTML, ttl: document.getElementById("ttl").innerHTML })'
    );
    const reloadState = JSON.parse(afterReload);
    results.push({
      name: 'reload resets c to 0',
      pass: reloadState.c === 0,
      detail: `c=${reloadState.c}`,
    });
    results.push({
      name: 'reload resets cc to 0',
      pass: reloadState.cc === 0,
      detail: `cc=${reloadState.cc}`,
    });
    results.push({
      name: 'reload resets rendered counter text',
      pass: reloadState.d === '0',
      detail: `d=${reloadState.d}`,
    });
    results.push({
      name: 'reload resets rendered title text to its static markup (render() not yet called)',
      pass: reloadState.ttl === 'Counter',
      detail: `ttl=${reloadState.ttl}`,
    });

    let allPass = true;
    for (const r of results) {
      console.log(`${r.pass ? 'PASS' : 'FAIL'}: ${r.name}${r.detail ? ' (' + r.detail + ')' : ''}`);
      if (!r.pass) allPass = false;
    }

    if (allPass) {
      console.log('ALL PASS');
      exitCode = 0;
    } else {
      console.error('FAIL: one or more behaviour assertions failed');
      exitCode = 1;
    }
  } catch (err) {
    console.error(`FAIL: harness error: ${err && err.message ? err.message : err}`);
    exitCode = 1;
  } finally {
    if (child) {
      try {
        child.kill();
      } catch {
        // already gone
      }
    }
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }

  process.exit(exitCode);
}

main();
