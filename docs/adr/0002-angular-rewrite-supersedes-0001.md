# 2. Angular rewrite supersedes ADR 0001's single-file decision

## Status

Accepted

## Context

ADR 0001 ("Single-file vs. build-step architecture for counter.html")
recorded a decision to pursue **Fork A: stay single-file** for the counter
widget: no build step, no bundler, no `package.json`, and no module system,
with behavior wired through a global `ACTION` object and a global `dispatch`
function reachable from a delegated click handler.

That same ADR's Consequences section anticipated this situation directly:

> If testability needs grow substantially in the future, that would be a
> reason to revisit this decision and consider Fork B — but that revisit
> should itself produce a new ADR rather than an ad-hoc change.

The counter widget is now being rewritten as a standalone Angular
application, structured around a `CounterService` (holding and mutating the
click-count state) and a `CounterComponent` (rendering the counter and
wiring up user interaction through Angular's own binding and event-handling
mechanisms, rather than a global `data-action`/`dispatch` pattern). Building,
type-checking, and running this application requires npm, TypeScript, and
the Angular CLI — i.e. exactly the build step and module system that Fork A
in ADR 0001 explicitly ruled out.

This document is that anticipated revisit, recorded as its own ADR rather
than as an ad-hoc change to ADR 0001.

## Decision

We adopt **Fork B: introduce a build step**, as described and anticipated in
ADR 0001, for the counter widget going forward.

This ADR **supersedes** ADR 0001's Fork A ("stay single-file") decision. The
counter widget's implementation moves to an Angular application with:

- A `package.json` and an npm-based toolchain.
- TypeScript sources compiled/bundled via the Angular CLI build pipeline.
- A real module system (Angular's component/service/dependency-injection
  model) in place of the global `ACTION` object and global `dispatch`
  function.

ADR 0001's no-build-step, no-module-system, single-file constraint is
superseded for the counter widget: it no longer applies to this widget going
forward. ADR 0001 itself is left unmodified as a historical record of the
original decision and its rationale; see
`0001-single-file-vs-build-step.md`.

## Consequences

- The counter widget is no longer a zero-dependency single file that can be
  opened directly in a browser with no install step; it now requires an npm
  install and a build (via the Angular CLI) before it can be run or served.
- A `package.json` and a TypeScript/Angular toolchain are now required
  dependencies of the project, which ADR 0001's Fork A explicitly ruled out.
- State (the click count) and behavior are now organized as an injectable
  `CounterService` and a `CounterComponent`, using Angular's module and
  dependency-injection system instead of a global `ACTION` object and global
  `dispatch` function reachable from a delegated click handler.
- The testability benefits anticipated in ADR 0001's Consequences section
  are realized: `CounterService` and `CounterComponent` can be unit-tested
  in isolation using Angular's testing utilities, rather than relying on
  manual/global wiring.
- Any future change back toward a single-file, no-build-step architecture
  for this widget would itself represent a reversal of this decision and
  should, per the same principle this ADR follows, produce its own ADR
  rather than an ad-hoc change.
