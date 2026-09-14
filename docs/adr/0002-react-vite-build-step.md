# 2. Adopt a React + Vite build step, superseding ADR 0001

## Status

Accepted

## Context

[ADR 0001](0001-single-file-vs-build-step.md) recorded a decision to keep
`counter.html` as a single, self-contained file with no build step, no
bundler, no module system, and no `package.json` ("Fork A"). That decision
was made on the basis that the widget was small, had no current requirement
for automated testing infrastructure, and benefited more from
zero-dependency portability (opening the file directly in a browser) than
it would from the testability a build step could bring.

That basis no longer holds. The project now requires the maintainability and
testability benefits that ADR 0001 explicitly identified as the trade-off
for "Fork B" — component-level structure, unit-testable modules, and
explicit dependency management — as the widget grows beyond what a single
inline script can comfortably support. ADR 0001 itself anticipated this:
"If testability needs grow substantially in the future, that would be a
reason to revisit this decision and consider Fork B — but that revisit
should itself produce a new ADR rather than an ad-hoc change." This ADR is
that revisit.

## Decision

We will pursue **Fork A no longer**, and instead adopt **Fork B: introduce a
build step**, superseding the decision recorded in
[ADR 0001](0001-single-file-vs-build-step.md).

Concretely:

- Introduce a `package.json` and a real dependency toolchain.
- Adopt [Vite](https://vitejs.dev/) as the build tool / dev server.
- Adopt [React](https://react.dev/) as the UI library, replacing the
  hand-rolled `dispatch`/`render` cycle and `data-action` delegated-click
  wiring described in ADR 0001 with React components and state.
- Adopt ES modules as the module system, replacing the classic
  (non-module) inline script that ADR 0001's Fork A required.

## Consequences

- **Portability is lost.** The app can no longer be opened directly as a
  single HTML file with no install step; it now requires `npm install` (or
  equivalent) and a build/dev-server step (`vite`/`vite build`) before it
  can run. This is the explicit cost ADR 0001 attributed to Fork B, and we
  are accepting it.
- **Testability and maintainability are gained.** Logic can be split into
  React components and modules that are unit-testable in isolation,
  dependencies become explicit `import`s instead of implicit global scope
  (`ACTION`, `dispatch`), and component/state structure replaces manual
  DOM wiring and event delegation.
- The no-build-step, no-module-system, single-file constraint that ADR 0001
  imposed on future refactors of `counter.html` no longer applies. Future
  work builds on the `package.json` / Vite / React toolchain instead.
- ADR 0001 remains in the history as the record of the original decision and
  its rationale; it is superseded by this ADR, not deleted.
