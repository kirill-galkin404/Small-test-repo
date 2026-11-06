# 2. Adopt React with a Vite build step

## Status

Accepted

Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose Fork A (stay single-file, no build step). The application's
frontend is now being rewritten to React, which requires a toolchain, ES
modules and a `package.json`. ADR 0001 itself said that revisiting the decision
should produce a new ADR rather than an ad-hoc change; this is that ADR.

## Decision

We adopt **Fork B: introduce a build step**, using Vite with React in plain
JavaScript (no TypeScript).

- A single `Counter` component holds the counter `c` and the click tally `cc`
  in `useState`; the color and title are derived at render time.
- Root `index.html` becomes the Vite entry; `public/counter.html` redirects to
  `./` so old `counter.html` URLs keep working. Vite uses `base: './'`.
- `style.css` is unchanged and imported from `src/main.jsx`.
- A Playwright characterization suite runs against a frozen copy of the legacy
  page and against the built React app to prove identical behavior.

## Consequences

- Loss of portability: the app can no longer be used by opening a file
  directly in a browser; it needs `npm install` and `npm run build` (or
  `npm run dev`), and the built output must be served over HTTP.
- Dependencies (react, react-dom, vite, @vitejs/plugin-react, Playwright) are
  now explicit and tracked in `package.json`.
- Components and behavior are testable through the browser suite.
