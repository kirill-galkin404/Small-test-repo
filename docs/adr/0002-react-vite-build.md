# 2. Rewrite the counter app with Vite + React (introduce a build step)

## Status

Accepted

Supersedes [ADR 0001](0001-single-file-vs-build-step.md), which chose to stay
single-file with no build step.

## Context

ADR 0001 chose Fork A (single-file, no build step) and said that revisiting
the decision must produce a new ADR rather than an ad-hoc change. This is
that ADR.

The counter app has been rewritten from a vanilla-JS static page into a
Vite + React application:

- State is managed with React's `useReducer`.
- Business rules live in a pure `src/rules.js` module with no DOM or React
  dependencies, so they can be tested in isolation. They are documented in
  `RULES.md`.
- A light/dark theme is supported and the user's choice is persisted.
- Tests are written with Vitest and React Testing Library.

These needs (isolated unit tests, explicit module imports, a testable
component structure) are the testability growth that ADR 0001 named as a
reason to reconsider Fork B.

## Decision

We adopt **Fork B: introduce a build step**, using Vite and React with ES
modules and a `package.json`. This supersedes ADR 0001; its Fork A constraints
(no bundler, no module system, no `package.json`) no longer apply.

## Consequences

- A build step is now required: Node and npm must be installed to install
  dependencies, run tests, and build the app.
- Opening the page directly from the file system (`file://`) no longer works.
  Vite builds emit module scripts, which browsers generally block over
  `file://`. `dist/` must be served over HTTP (`npm run preview` or any static
  server), even with `base: './'`.
- The old `counter.html` URL is kept as a meta-refresh redirect
  (`public/counter.html`) to the root, so existing links keep working.
- Business rules are covered by Vitest unit tests against `src/rules.js`, and
  UI behavior by React Testing Library tests.
- Any future change of this architectural direction must itself produce a new
  ADR rather than an ad-hoc change.
