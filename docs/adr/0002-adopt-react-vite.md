# 2. Adopt React with a Vite build

## Status

Accepted

This ADR supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose Fork A: keep the counter as a single self-contained
`counter.html` with no build step, no module system and no `package.json`.
That decision left the repository without automated tests and tied the
widget to global scope (`ACTION`, `dispatch`) and manual DOM wiring. ADR 0001
also stated that a revisit of that decision, should testability needs grow,
must produce a new ADR rather than an ad-hoc change. This is that ADR.

The project is now being rewritten in React, which requires a build toolchain
and ES modules. Keeping the single-file, no-build constraint of ADR 0001 would
be inconsistent with that rewrite, so the inconsistency has to be resolved
explicitly by superseding ADR 0001.

## Decision

We adopt **Fork B** from ADR 0001: introduce a build step.

- The counter is implemented in React and built with Vite, using npm and a
  `package.json`, with ES modules.
- Tests are written and run with Vitest.
- The app stays static: the build output goes to `dist/`, and Vite's `base`
  is set to `./` so that `dist/` can be served from any static path.
- `counter.html` and `counter.js` are removed; `index.html` becomes the entry
  point.
- `style.css` is kept unchanged.
- Counter behaviour is unchanged by this rewrite.

## Consequences

- The "open the file directly in a browser" portability of ADR 0001 is lost.
  The built `dist/` must be served over static hosting (any static file
  server or path will do).
- Building and developing require Node and npm; dependencies are installed
  from `package.json`.
- Modules can be unit-tested in isolation with Vitest, and dependencies are
  explicit imports rather than globals.
- ADR 0001's constraints (no build step, no module system, no `package.json`,
  single file) no longer apply. ADR 0001 is retained as a historical record,
  marked as superseded.
