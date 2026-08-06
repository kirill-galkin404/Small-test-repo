# 2. Static test harness for counter.js

## Status

Accepted

## Context

ADR 0001 ("Single-file vs. build-step architecture for counter.html") chose
Fork A — stay single-file, no bundler, no runtime module system — and noted
in its Consequences section:

> If testability needs grow substantially in the future, that would be a
> reason to revisit this decision and consider Fork B — but that revisit
> should itself produce a new ADR rather than an ad-hoc change.

Porting the counter widget's logic from `counter.js` to a typed `counter.ts`
source (compiled to `counter.js` via `tsc` with `module: "none"` and
`outFile`) closed the "no static types" gap, but the project still has no
automated tests at all — a manual click-through in a browser was the only
way to check for regressions. That revisit trigger has now been reached: we
want confidence that future edits to `counter.ts` don't silently change
`dispatch`'s branch behaviour, the `cc` click counter, or `render`'s DOM
output, without introducing a test framework or bundler.

## Decision

We adopt a static, no-build test page — `counter.test.html` — rather than a
test framework or bundler:

- `counter.test.html` is a plain HTML file, sibling to `counter.html`, with
  its own `#counter`/`#d`/`#ttl` markup so `render()` has real DOM targets
  to write into.
- It loads the tsc-emitted `counter.js` via a plain, classic (non-module)
  `<script src="counter.js"></script>` tag — the same way `counter.html`
  does — and then runs inline `<script>` assertions against the page's own
  global `ACTION`, `dispatch`, and the new `getState()` accessor added to
  `counter.ts` for this purpose.
- There is no test runner, no assertion library, and no new `package.json`
  dependency. Failures render as red `FAIL` lines directly on the page and
  are also written via `console.error`, so opening the file in a browser
  (or a headless run of the same) is sufficient to read pass/fail.
- Both `counter.html` and `counter.test.html` remain zero-install: opening
  either directly via `file://` works with no server and no build step
  beyond the existing `npm run build` used to regenerate `counter.js` from
  `counter.ts`.

We explicitly do not adopt ES modules for this harness. Module scripts are
blocked by browsers when a page is opened directly over `file://`, which
would break the zero-install property this whole repository is built on. If
ES modules are wanted for testing in the future, that would require running
a static file server (e.g. `python -m http.server`) instead of opening the
file directly — a further trade-off this decision does not take on.

## Consequences

- `counter.ts` gains one additional exposed function, `getState(): { c:
  number; cc: number }`, purely to let `counter.test.html` read state
  without changing the production shape of `c`/`cc` (still module-global
  `var`s) or of `ACTION`/`dispatch` (still reachable as globals, per ADR
  0001).
- Regressions in `dispatch`'s five action branches, the unrecognized-action
  no-op, the delegated-listener no-op, `render`'s colour thresholds, or the
  `#ttl` text are caught by opening `counter.test.html` and checking for any
  `FAIL` line or `console.error` output.
- This does not replace ADR 0001's Fork A decision — no bundler and no
  runtime module system have been introduced. If test needs grow further
  (e.g. wanting a real assertion library, CI integration, or ES modules),
  that should again be weighed as a revisit of Fork A vs. Fork B, recorded
  in a new ADR.
