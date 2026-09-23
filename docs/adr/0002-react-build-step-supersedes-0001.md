# 2. React/Vite build step supersedes ADR 0001's Fork A

## Status

Accepted

## Context

ADR 0001 ("Single-file vs. build-step architecture for counter.html")
recorded a choice between two mutually exclusive architectural forks for
the counter widget:

- **Fork A — stay single-file**: no build step, no bundler, no
  `package.json`, no module system, with `ACTION` and `dispatch` reachable
  as globals from a delegated click handler.
- **Fork B — introduce a build step**: adopt a bundler (e.g. esbuild,
  Vite, or similar), ES modules, and a real entry point with a
  `package.json`.

ADR 0001 chose **Fork A** and explicitly stated that future refactors of
`counter.html` must preserve the no-build-step, no-module-system,
single-file constraint, and that any move to Fork B "should itself produce
a new ADR rather than an ad-hoc change."

The counter widget is now being rewritten as a React application built with
Vite. This rewrite introduces:

- A `package.json` with npm `dev` and `build` scripts.
- A Vite build step (bundler + dev server).
- An ES module system (`import`/`export`) replacing the classic inline
  `<script>`.
- React components and state (e.g. `useState`) replacing the global,
  frozen `ACTION` object and the global `dispatch()` function together
  with the delegated `addEventListener("click", ...)` handler.

This is a single cut-over: the codebase moves directly from the vanilla
`dispatch()`/`ACTION`-globals implementation to React, and does not ship
both approaches at once.

## Decision

We supersede ADR 0001's **Fork A** ("stay single-file") decision. The
counter widget will use **Fork B**-style tooling going forward: a Vite
build step, a `package.json`, npm `dev`/`build` scripts, and ES modules,
as required to implement the widget in React.

ADR 0001 itself is left unedited as a historical record of the
single-file decision and its rationale at the time it was made. This ADR
(0002) is the record that ADR 0001's Fork A choice no longer applies: it
has been superseded by the React/Vite rewrite.

## Consequences

- The zero-dependency, "open the file directly in a browser" portability
  described in ADR 0001 no longer holds: building or running the counter
  widget now requires Node tooling (`npm install`, then `npm run dev` or
  `npm run build`).
- `ACTION` and `dispatch` as global, script-scope constructs are retired;
  state and actions are expressed as React state and event handlers
  instead.
- Future changes to the counter widget should assume the Vite/React/
  `package.json` toolchain is present, rather than the single-file
  constraint recorded in ADR 0001.
- ADR 0001 remains in the repository unedited, as a record of the
  original decision and rationale; this ADR (0002) is the authoritative
  record that ADR 0001's Fork A decision has been superseded.
