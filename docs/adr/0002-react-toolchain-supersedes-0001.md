# 2. React/Vite toolchain supersedes ADR 0001

## Status

Accepted

## Context

[ADR 0001](0001-single-file-vs-build-step.md) decided to keep `counter.html`
as a single, self-contained file with no build step, no bundler, and no
`package.json` (Fork A), while explicitly noting:

> If testability needs grow substantially in the future, that would be a
> reason to revisit this decision and consider Fork B — but that revisit
> should itself produce a new ADR rather than an ad-hoc change.

The counter widget is now being rewritten as a component-based React
application with an automated test suite (Vitest + React Testing Library).
That requirement — real, isolated unit/component tests exercising the
action/dispatch and render/colour-threshold logic — is exactly the
"testability needs grow substantially" trigger ADR 0001 anticipated.

## Decision

We adopt **Fork B** from ADR 0001: a build step. Concretely, the project now
uses Vite for development/build and Vitest with React Testing Library for
tests, with `package.json` declaring `react`, `react-dom`, `vite`,
`@vitejs/plugin-react`, `vitest`, `@testing-library/react`,
`@testing-library/jest-dom`, and `jsdom`.

This decision supersedes ADR 0001's Fork A choice. ADR 0001 is left unedited
as a historical record of the original decision and its rationale; this ADR
is the record of the revisit it called for.

## Consequences

- The project now has a build step, a module system (ES modules via React
  JSX), and a `package.json` — the constraints ADR 0001 previously ruled out.
- The widget is no longer a single file that can be opened directly in a
  browser without an install step; `npm install` and `npm run build`/`npm
  run dev` are now required.
- In exchange, the action/dispatch and render/colour-threshold logic is unit-
  and component-testable in isolation via Vitest and React Testing Library.
