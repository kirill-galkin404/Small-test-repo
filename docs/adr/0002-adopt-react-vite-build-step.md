# 2. Adopt a React + Vite build step for the counter app

## Status

Accepted

This ADR supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose Fork A (stay single-file, no build step, no module system,
no `package.json`) and stated that a substantial growth in testability needs
should be revisited through a new ADR rather than an ad-hoc change. That
need has now arisen: the counter's state logic and presentation are tangled
in global scope (`ACTION`, `dispatch`, `render()`), which makes them hard to
unit-test in isolation. The counter app is being rewritten as a React
application, which requires a toolchain and ES modules, so Fork A's
constraints can no longer hold.

## Decision

We adopt **Fork B: introduce a build step**, using Vite + React, with Vitest
for tests.

- State logic is extracted into a pure `counterReducer`
  (`src/counterReducer.js`) and a pure `valueColor` function
  (`src/valueColor.js`), both unit-testable without a DOM.
- The UI is a single `Counter` component that uses `useReducer` with
  `counterReducer`. Button labels remain `+`, `-`, `reset`, `+4`, `x2`; the
  heading is `Counter` until the first click, then `Counter (N clicks)`.
- `counter.html` is kept as a redirect to the new entry point, shipped as
  `public/counter.html`, because external links to it cannot be ruled out.
- The project stays minimal: no TypeScript, no router, no state-management
  library, and no CI.
- Publishing or deploying the built `dist` output is out of scope for this
  decision.

## Consequences

- The repository now has a `package.json`, a Vite entry point, ES modules and
  a toolchain dependency; the "open the file directly in a browser"
  portability of ADR 0001 is given up.
- Reducer and color logic can be unit-tested in isolation with Vitest.
- ADR 0001's constraints (no bundler, no module system, no `package.json`)
  no longer apply; its status is Superseded by 0002.
- Any further change of architectural direction (for example adding
  TypeScript, a router, a state library, or CI) should itself produce a new
  ADR rather than an ad-hoc change.
