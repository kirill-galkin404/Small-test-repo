'use strict';
/**
 * Characterization harness for the legacy vanilla-JS counter.js.
 *
 * Loads counter.js inside a Node `vm` context with a minimal fake DOM
 * (just enough `document.getElementById` stubs for #counter, #d, #ttl)
 * and exercises its click-dispatch behavior directly, asserting the
 * rules captured in legacy-contract/contract.md (R-0001..R-0009).
 *
 * Exits 0 if every assertion passes, non-zero (and prints the failure)
 * otherwise. No test framework dependency - plain Node `vm` + `assert`.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const COUNTER_JS_PATH = path.join(__dirname, '..', 'counter.js');
const source = fs.readFileSync(COUNTER_JS_PATH, 'utf8');

// --- Minimal fake DOM -------------------------------------------------

function makeElement(id) {
  return {
    id: id,
    innerHTML: '',
    style: { color: '' },
    dataset: {},
    _clickHandlers: [],
    addEventListener: function (type, handler) {
      if (type === 'click') this._clickHandlers.push(handler);
    },
  };
}

function makeDocument() {
  const elements = {
    counter: makeElement('counter'),
    d: makeElement('d'),
    ttl: makeElement('ttl'),
  };
  return {
    elements: elements,
    getElementById: function (id) {
      if (!elements[id]) {
        throw new Error('fake document: unknown element id "' + id + '"');
      }
      return elements[id];
    },
  };
}

// Builds a fresh vm context (fresh c/cc/module state) per test case, so
// tests don't leak counter state into each other.
function loadCounter() {
  const fakeDocument = makeDocument();
  const sandbox = {
    document: fakeDocument,
    console: console,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'counter.js' });

  // Simulate a click on the #counter container the way a real browser
  // would: the event target is one of the buttons, with dataset.action
  // (or no action at all, mimicking a click that doesn't hit a button).
  function click(actionCode) {
    const target = { dataset: {} };
    if (actionCode !== undefined) target.dataset.action = actionCode;
    const handlers = fakeDocument.elements.counter._clickHandlers;
    assert.strictEqual(handlers.length, 1, 'expected exactly one click listener bound to #counter');
    handlers[0]({ target: target });
  }

  return {
    sandbox: sandbox,
    dom: fakeDocument,
    click: click,
    getC: function () { return sandbox.c; },
    getCc: function () { return sandbox.cc; },
  };
}

// --- Test cases ---------------------------------------------------------

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok - ' + name);
  } catch (err) {
    console.error('  FAIL - ' + name);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

console.log('Legacy counter.js characterization harness');

// R-0008: click with no data-action (e.g. clicking whitespace inside
// #counter, not on a button) leaves c and cc unchanged, no re-render.
test('R-0008: click with no data-action leaves c and cc unchanged', () => {
  const app = loadCounter();
  const before = { c: app.getC(), cc: app.getCc() };
  app.click(undefined);
  assert.strictEqual(app.getC(), before.c);
  assert.strictEqual(app.getCc(), before.cc);
  // no render happened: #d / #ttl innerHTML stay at their initial ''
  assert.strictEqual(app.dom.elements.d.innerHTML, '');
  assert.strictEqual(app.dom.elements.ttl.innerHTML, '');
});

// R-0008: click with an unmapped action code (ACTION[unknown] is
// undefined, dispatch()'s switch hits `default`) leaves c and cc
// unchanged, no re-render.
test('R-0008: click with unmapped data-action leaves c and cc unchanged', () => {
  const app = loadCounter();
  app.click('INCREMENT'); // establish a known, non-zero state first
  const before = { c: app.getC(), cc: app.getCc() };
  app.click('NOT_A_REAL_ACTION');
  assert.strictEqual(app.getC(), before.c);
  assert.strictEqual(app.getCc(), before.cc);
});

// R-0003 / R-0009: INCREMENT adds 1 to c and increments cc.
test('R-0003/R-0009: INCREMENT increases c by 1 and bumps cc', () => {
  const app = loadCounter();
  app.click('INCREMENT');
  assert.strictEqual(app.getC(), 1);
  assert.strictEqual(app.getCc(), 1);
  app.click('INCREMENT');
  assert.strictEqual(app.getC(), 2);
  assert.strictEqual(app.getCc(), 2);
});

// R-0004 / R-0009: DECREMENT subtracts 1 from c and increments cc.
test('R-0004/R-0009: DECREMENT decreases c by 1 and bumps cc', () => {
  const app = loadCounter();
  app.click('DECREMENT');
  assert.strictEqual(app.getC(), -1);
  assert.strictEqual(app.getCc(), 1);
});

// R-0005 / R-0009: RESET sets c to 0 but does NOT reset cc.
test('R-0005/R-0009: RESET zeroes c but leaves cc (click counter) alone', () => {
  const app = loadCounter();
  app.click('INCREMENT');
  app.click('INCREMENT');
  app.click('ADD_FOUR');
  assert.strictEqual(app.getC(), 6);
  assert.strictEqual(app.getCc(), 3);
  app.click('RESET');
  assert.strictEqual(app.getC(), 0);
  assert.strictEqual(app.getCc(), 4); // RESET itself is a dispatched action -> cc still increments
});

// R-0006 / R-0009: ADD_FOUR adds 4 to c and increments cc.
test('R-0006/R-0009: ADD_FOUR increases c by 4 and bumps cc', () => {
  const app = loadCounter();
  app.click('ADD_FOUR');
  assert.strictEqual(app.getC(), 4);
  assert.strictEqual(app.getCc(), 1);
});

// R-0007 / R-0009: DOUBLE multiplies c by 2 and increments cc.
test('R-0007/R-0009: DOUBLE doubles c and bumps cc', () => {
  const app = loadCounter();
  app.click('ADD_FOUR'); // c = 4
  app.click('DOUBLE');   // c = 8
  assert.strictEqual(app.getC(), 8);
  assert.strictEqual(app.getCc(), 2);
});

// R-0001: color thresholds - red when c > 10, blue when c < 0, black
// otherwise (including the boundary c === 10, which is black not red).
test('R-0001: display color is black for 0 <= c <= 10', () => {
  const app = loadCounter();
  for (let i = 0; i < 10; i++) app.click('INCREMENT'); // c = 10
  assert.strictEqual(app.getC(), 10);
  assert.strictEqual(app.dom.elements.d.style.color, 'black');
});

test('R-0001: display color is red when c > 10', () => {
  const app = loadCounter();
  for (let i = 0; i < 11; i++) app.click('INCREMENT'); // c = 11
  assert.strictEqual(app.getC(), 11);
  assert.strictEqual(app.dom.elements.d.style.color, 'red');
});

test('R-0001: display color is blue when c < 0', () => {
  const app = loadCounter();
  app.click('DECREMENT'); // c = -1
  assert.strictEqual(app.getC(), -1);
  assert.strictEqual(app.dom.elements.d.style.color, 'blue');
});

test('R-0001: display color is black when c === 0', () => {
  const app = loadCounter();
  app.click('INCREMENT');
  app.click('DECREMENT'); // c back to 0
  assert.strictEqual(app.getC(), 0);
  assert.strictEqual(app.dom.elements.d.style.color, 'black');
});

// R-0002 & the "Counter (N clicks)" title format: the #ttl heading
// (not document.title) always reflects cc, the count of valid
// dispatched clicks, formatted exactly as "Counter (N clicks)".
test("R-0002: #ttl shows 'Counter (N clicks)' reflecting cc, not c", () => {
  const app = loadCounter();
  app.click('INCREMENT');
  assert.strictEqual(app.dom.elements.ttl.innerHTML, 'Counter (1 clicks)');
  app.click('ADD_FOUR');
  assert.strictEqual(app.dom.elements.ttl.innerHTML, 'Counter (2 clicks)');
  app.click('RESET'); // c resets to 0, but cc (and thus the title) keeps counting
  assert.strictEqual(app.getC(), 0);
  assert.strictEqual(app.dom.elements.ttl.innerHTML, 'Counter (3 clicks)');
  // an unmapped/no-op click must NOT bump the displayed click count
  app.click(undefined);
  app.click('BOGUS');
  assert.strictEqual(app.dom.elements.ttl.innerHTML, 'Counter (3 clicks)');
});

// #d's innerHTML always mirrors the raw numeric value of c.
test("render(): #d innerHTML mirrors c's numeric value", () => {
  const app = loadCounter();
  app.click('ADD_FOUR');
  app.click('DOUBLE');
  assert.strictEqual(app.dom.elements.d.innerHTML, 8);
});

console.log('\n' + passed + ' assertion group(s) passed.');
if (process.exitCode && process.exitCode !== 0) {
  console.error('\nHarness FAILED.');
} else {
  console.log('Harness PASSED.');
}
