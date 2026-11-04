# 2. Adopt React and Vite for the counter app

## Status

Accepted

This ADR supersedes [ADR 0001](0001-single-file-vs-build-step.md), which
chose Fork A (stay single-file, no build step).

## Context

ADR 0001 chose to keep the counter as a single, dependency-free file, and
explicitly named testability and maintainability as the reason to revisit that
choice (Fork B), requiring a new ADR when that happened. The counter page,
its state, action dispatch and click handling lived in global scope with a
delegated click listener, which made the logic hard to unit-test in isolation.

## Decision

We adopt **Fork B: introduce a build step**, using Vite and React.

- The counter app (counter page, counter state, action dispatch, click
  handling) was rewritten as a Vite + React app.
- A single pure reducer, `counterReducer`, in `src/counterReducer.js` (cases
  `INCREMENT`, `DECREMENT`, `RESET`, `ADD_FOUR`, `DOUBLE`) drives a `Counter`
  component via `useReducer`.
- Per-button `onClick` handlers replace the delegated click listener.
- The `data-action` attributes and the ids `#counter`, `#ttl` and `#d` are
  kept, and `style.css` is unchanged.
- `index.html` is the Vite entry and mounts `#root`. The legacy `counter.html`
  URL is kept as `public/counter.html`, a meta-refresh to `./`.
- `vitest`, `jsdom` and `@testing-library/react` are added for tests.
- Behaviour is preserved, including the click count and the colour
  thresholds. State is in memory only.

Rationale: ADR 0001 itself named testability and maintainability as the reason
to revisit its decision and required a new ADR when doing so. A pure reducer
can be unit-tested in isolation and the component tested through the DOM. The
trade-off we accept is the toolchain dependency and the loss of
open-the-file-directly portability.

## Consequences

- Node >=22.12 and `npm install` are required to work on the app.
- Development, build and test run via `npm run dev`, `npm run build` and
  `npm test`.
- ADR 0001's constraints (no build step, no module system, no `package.json`,
  single file) no longer apply.
