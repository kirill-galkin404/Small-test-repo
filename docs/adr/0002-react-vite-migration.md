# 2. Fork A to React/Vite migration for counter.html

## Status

Accepted

## Context

ADR-0001 ("Single-file vs. build-step architecture for counter.html")
recorded a decision to pursue **Fork A: stay single-file** — no build step,
no bundler, no `package.json`, and no module system — on the grounds that
`counter.html` was a small, self-contained demo/utility widget with no
current requirement for automated testing infrastructure.

That has changed. Testability needs have grown substantially:

- The counter's state-transition logic and display-formatting logic need
  unit tests in isolation (`src/reducer.js` and `src/formatter.js`, each
  with a corresponding `*.test.js`), which requires code to exist as
  importable modules rather than globals wired into a classic inline
  `<script>`.
- The UI itself is moving to React (`src/main.jsx`, and the `Counter`
  component it mounts), which requires JSX compilation and component
  rendering/testing support that a single static HTML file cannot provide
  on its own.
- A `package.json` has been introduced with `vite`, `vitest`, `jsdom`, and
  `@vitejs/plugin-react` as dev dependencies, and `react`/`react-dom` as
  runtime dependencies, along with `dev`, `build`, and `test` npm scripts
  and a `vite.config.js` — i.e. exactly the toolchain, module system, and
  `package.json` that ADR-0001's Fork A decision rejected.

ADR-0001's Consequences section anticipated this scenario directly: "If
testability needs grow substantially in the future, that would be a reason
to revisit this decision and consider Fork B — but that revisit should
itself produce a new ADR rather than an ad-hoc change." This document is
that new ADR. It does not edit or reverse ADR-0001's historical record;
ADR-0001 remains an accurate account of the decision that was made and why,
at the time it was made.

## Decision

We will revisit and supersede ADR-0001's **Fork A** choice, and instead
adopt what ADR-0001 described as **Fork B: introduce a build step** —
specifically, a Vite + React + `package.json`-based module and build
system.

Concretely:

- `package.json` defines the project's dependencies (`react`, `react-dom`)
  and devDependencies (`vite`, `vitest`, `jsdom`,
  `@vitejs/plugin-react`), plus `dev`/`build`/`test` npm scripts.
- `vite.config.js` configures Vite (with the React plugin) as the
  project's build tool and dev server.
- Application logic is split into ES modules under `src/` (e.g.
  `src/reducer.js`, `src/formatter.js`), each independently unit-tested
  (`src/reducer.test.js`, `src/formatter.test.js`) via Vitest.
  UI rendering moves to React components (mounted from `src/main.jsx`).

This decision is made per the amendment procedure ADR-0001 itself
specifies: rather than editing ADR-0001 or making an ad-hoc change, the
revisit is recorded here, in a new ADR, superseding the Fork A decision.

## Consequences

- The project now has a real build step: `vite build` compiles and bundles
  the application, and `vite`/`npm run dev` runs a dev server. The
  single-file, "open directly in a browser with no install step" property
  that Fork A preserved no longer holds.
- The project has npm dependencies (`react`, `react-dom` at runtime;
  `vite`, `vitest`, `jsdom`, `@vitejs/plugin-react` for development/build/
  test) and a bundler (Vite), which ADR-0001's Fork A explicitly avoided.
- Application code is organized as ES modules (`src/*.js`, `src/*.jsx`)
  rather than a single classic inline `<script>` relying on global scope;
  `ACTION`/`dispatch`-style global wiring is no longer a constraint.
- Reducer and formatting logic can now be unit-tested in isolation
  (`src/reducer.test.js`, `src/formatter.test.js`), and UI can be
  component-tested, which was the testability gap ADR-0001 identified as
  the trigger for a future revisit.
- `RULES.md` documents the resulting React-era module and testing
  conventions for this project. It intentionally does not restate
  ADR-0001's Fork A "no build step, no module system, no `package.json`"
  constraint, because that constraint is superseded by this ADR.
- ADR-0001 itself is left unedited: it remains the historical record of the
  original single-file decision and the context in which it was made. This
  ADR is the "new ADR" that ADR-0001's Consequences section required for
  any such revisit.
