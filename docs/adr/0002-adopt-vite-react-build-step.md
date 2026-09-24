# 2. Adopt a Vite/React build step for the counter widget

## Status

Accepted

## Context

[ADR 0001](./0001-single-file-vs-build-step.md) ("Single-file vs. build-step
architecture for counter.html") decided to pursue **Fork A: stay
single-file**, keeping `counter.html` as a single, self-contained file with
no build tooling, no module system, and no `package.json`. That ADR
explicitly anticipated this situation: it recorded that "if testability
needs grow substantially in the future, that would be a reason to revisit
this decision and consider Fork B — but that revisit should itself produce a
new ADR rather than an ad-hoc change." This document is that new ADR.

Since ADR 0001 was accepted, testability needs have grown substantially:

- The plan for this widget now calls for a full **React rewrite** of the
  counter, replacing the hand-wired `data-action` / delegated-listener /
  global-`dispatch` architecture described in ADR 0001 with React components
  and a reducer.
- This rewrite requires **component tests** (rendering and interaction
  tests for the React components) and **reducer tests** (unit tests for the
  state-transition logic previously implemented as the `dispatch` switch
  statement) that are impractical to write against a classic, non-module
  inline `<script>` block with no test runner or module system.
- React itself is a UI library that is normally consumed as an ES module (or
  UMD build) and is idiomatically composed with JSX, which requires a
  compilation/transform step; this does not fit within ADR 0001's "no
  build-step, no module-system, single-file" constraint.

Given this, we are exercising the revisit ADR 0001 anticipated, and choosing
**Fork B — introduce a build step**, as described (but not selected) in ADR
0001's own text.

## Decision

We will introduce **Vite** as the build tool and **React 18** as the UI
runtime for the counter widget, superseding ADR 0001's Fork A ("stay
single-file") decision.

This retires the constraint ADR 0001 fixed — that the widget must remain a
single file with no build step, no bundler, no module system, and no
`package.json`. In its place:

- The project gains a `package.json`, ES modules, and a Vite-driven build
  and dev/test toolchain.
- The counter UI is rewritten as React 18 components, with state management
  expressed as a reducer that can be unit-tested independently of the DOM,
  and components that can be rendered and interacted with in component
  tests.
- `counter.html`, `counter.js`, `style.css`, and the meta-refresh
  `index.html` — the artifacts of the single-file, no-build architecture
  ADR 0001 established — are retired and removed as part of this change.
  (Their removal/rewrite is carried out by a later step in this plan; this
  ADR only authorizes and records the decision to do so.)

## Consequences

- The counter widget is no longer zero-dependency/portable in the sense
  ADR 0001 valued: it can no longer be opened directly in a browser without
  a build step, and it now depends on an installed Node/Vite toolchain to
  build and run.
- `ACTION` and `dispatch` as global, script-scope-reachable symbols (as
  fixed by ADR 0001) no longer apply; state transitions move into a reducer
  module, and click handling is wired through React component event
  handlers and props instead of a `data-action` attribute and a single
  delegated listener.
- The project gains real testability: reducer logic can be unit-tested in
  isolation, and components can be tested with a component-testing setup,
  which was the trade-off ADR 0001 declined to take at the time.
- Any future proposal to drop the build step and return to a single-file
  architecture should itself produce a new ADR rather than an ad-hoc change,
  consistent with the practice ADR 0001 established.
