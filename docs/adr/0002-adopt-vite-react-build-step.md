# 2. Adopt a Vite + React build step

## Status

Accepted. Supersedes [0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose to keep `counter.html` single-file with no build step and said
that growing testability needs should be a reason to revisit that decision in
a new ADR. The counter frontend is being rewritten in React so that its
logic can be unit-tested in isolation and its UI expressed as components.
That requires a toolchain, ES modules and a `package.json`.

## Decision

- Adopt **Vite** with `@vitejs/plugin-react` as the build tool and dev server.
- Rewrite the UI in **React**. Counter logic lives in a pure `counterReducer`
  module consumed by a `Counter` component through `useReducer`.
- Test with Vitest, React Testing Library and jsdom.
- Use **no router**. The app has two pages: `index.html` (unchanged static
  meta-refresh redirect to `counter.html`) and `counter.html` (the Vite entry
  with a `#root` element). Both are Vite build inputs.
- Observable behavior, element ids (`#ttl`, `#d`), `data-action` values and
  `style.css` are unchanged. State remains in memory only.
- The per-action `console.log` debug output of the old `counter.js` is
  deliberately dropped so the reducer stays pure. Only the unknown-action
  `console.warn` remains.

## Consequences

- Fork B of ADR 0001 is adopted; the "open the file directly, no install
  step" portability is lost. `counter.html` now references `/src/main.jsx`,
  so serving the repository root or opening the file directly no longer
  works. Run `npm run dev`, or build with `npm run build` and deploy `dist/`
  (the build uses a relative base, `./`) in place of the raw files.
- Contributors need Node.js and `npm ci` to work on the project; `package-lock.json`
  is committed for reproducible installs.
- `node_modules/` and `dist/` are git-ignored.
- Logic and UI become unit-testable in isolation.
