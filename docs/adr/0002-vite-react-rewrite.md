# 2. Rewrite the counter as a Vite + React app

## Status

Accepted. Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose Fork A: keep the counter as a single file with no build step,
no module system and no `package.json`. That decision explicitly said a
future need for testability should be revisited in a new ADR. That need has
arrived: the counter's rules must be unit-tested, and the UI is to be built
from components. A classic inline script cannot be unit-tested without a test
runner and cannot host JSX components. The rewrite therefore requires both a
build step and a `package.json`, which ADR 0001 forbids, so a new ADR must
supersede it.

## Decision

We adopt Fork B from ADR 0001 and rewrite the counter with:

- **Vite** with `@vitejs/plugin-react` as the dev server and bundler.
- **React 18** for the UI components.
- **Vitest** with **jsdom** and **React Testing Library** for tests.
- A `package.json` at the repository root.

The counter's rules live in a pure reducer module, `src/counterRules.js`,
which the React components call into and which is tested in isolation.

Rejected alternative: keep the single-file/inline-script design. It cannot be
unit-tested without a test runner and cannot host JSX components.

Old links to `counter.html` keep working: `public/counter.html` is a page
that meta-refreshes to `./`. Vite copies everything in `public/` to the build
root, so the redirect is present in `dist/`. Vite's `index.html` becomes the
app entry point (it was previously the redirect to `counter.html`).

## Consequences

- A build step and a `package.json` now exist; contributors must run
  `npm install` and use the npm scripts to develop, test and build.
- The old "open the file directly" portability is lost. Vite builds emit
  `type="module"` scripts, which do not run from `file://` in most browsers.
  Setting `base: './'` makes `dist` relocatable, but it must still be served
  over http, e.g. with `npm run preview`.
- The counter's rules now live in a pure, tested module
  (`src/counterRules.js`) instead of global `ACTION`/`dispatch` in an inline
  script.
- There is one dark theme and no theme toggle.
- ADR 0001 is kept for history with its Status changed to
  "Superseded by ADR 0002".
