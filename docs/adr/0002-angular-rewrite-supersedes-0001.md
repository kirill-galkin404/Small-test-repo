# 2. Angular rewrite of the counter widget supersedes ADR 0001

## Status

Accepted

## Context

ADR 0001 (`0001-single-file-vs-build-step.md`) recorded a choice between two
mutually exclusive architectural directions for `counter.html`:

- **Fork A — Stay single-file**: no build step, no module system, no
  `package.json`; behavior wired via a `data-action` attribute and a single
  delegated `addEventListener` calling a global `dispatch` function.
- **Fork B — Introduce a build step**: adopt a toolchain and ES modules (or
  an equivalent component framework) so that logic can be unit-tested in
  isolation and dependencies become explicit.

ADR 0001 decided on Fork A, on the grounds that the widget was small enough
that zero-dependency portability outweighed testability. It explicitly
anticipated that this decision might need revisiting:

> If testability needs grow substantially in the future, that would be a
> reason to revisit this decision and consider Fork B — but that revisit
> should itself produce a new ADR rather than an ad-hoc change.

That revisit has now happened. The counter widget is being rewritten as a
standalone Angular application, replacing the legacy global-script
`counter.js` / `counter.html` / `index.html` / `style.css` files with:

- A `CounterService` that owns state and the dispatch/action logic
  previously implemented as the global `ACTION` object and `dispatch`
  function.
- A `CounterComponent` that owns the template, data bindings, and display,
  replacing the `data-action` attribute wiring and the manually
  event-delegated click handler.
- A build step, a module system, and a `package.json`, as required by the
  Angular CLI/toolchain.

This is materially the Fork B direction ADR 0001 anticipated: a toolchain,
a module system, and componentized structure in place of a single
self-contained HTML file with global scope.

## Decision

We adopt **Fork B: introduce a build step**, via an Angular rewrite of the
counter widget, and this ADR **supersedes ADR 0001's Fork A decision**.

`counter.html`'s single-file, no-build-step, no-module-system constraint no
longer applies to the counter widget going forward. State and dispatch
logic move into an injectable `CounterService`; template, bindings, and
display move into a `CounterComponent`. `docs/adr/0001-single-file-vs-build-step.md`
is left unmodified as a historical record of the original decision; this
document is the record of the revisit and the new decision.

Rationale, matching the conditions ADR 0001 set for revisiting Fork A:

- **Real testability**: logic previously reachable only via global scope
  and manual DOM wiring (`ACTION`, `dispatch`) can now be unit-tested in
  isolation as `CounterService` methods, independent of rendering.
- **Component structure**: separating state/dispatch (`CounterService`)
  from template/bindings/display (`CounterComponent`) replaces
  event-delegated, attribute-driven wiring with Angular's explicit,
  declarative binding model, making the data flow easier to reason about
  and to extend (e.g. the accompanying dark theme).
- **Growing scope**: the widget is gaining requirements (dark theme,
  documented rules, a rewritten README) that benefit from a conventional,
  componentized project structure rather than continued growth inside a
  single global script.

## Consequences

- `counter.js`, `counter.html`, `index.html`, and `style.css` are retired in
  favor of the Angular application's own entry point, components, and
  styles.
- The project now has a `package.json` and a build toolchain (the Angular
  CLI build), which ADR 0001 had explicitly ruled out for this widget;
  that prohibition is lifted by this ADR.
- `ACTION`/`dispatch` as global, script-scope constructs are replaced by
  `CounterService`'s encapsulated state and methods, injected into
  `CounterComponent` rather than reached via global scope or `dataset`
  lookups.
- Future changes to the counter widget should follow Angular's module/
  component conventions rather than the single-file constraints from ADR
  0001.
- `docs/adr/0001-single-file-vs-build-step.md` remains unmodified as the
  historical record of the original decision and its rationale; this ADR
  is the sole record of the supersession.
