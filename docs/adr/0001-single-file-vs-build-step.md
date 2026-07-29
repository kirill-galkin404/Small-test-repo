# 1. Single-file vs. build-step architecture for counter.html

## Status

Accepted (amended)

## Context

`counter.html` is currently a single, self-contained HTML file:

- There is no build step, no bundler, and no `package.json` anywhere in the
  repository.
- There is no module system: the page's `<script>` block is a classic
  (non-module) inline script, and it has no external JS or CSS dependencies.
- Behavior is wired via a `data-action` attribute on each button (e.g.
  `data-action="INCREMENT"`), read by a single event-delegated
  `addEventListener("click", ...)` registered on the `#counter` container.
  The handler reads `event.target.dataset.action`, looks it up in the
  global, frozen `ACTION` object, and calls the global `dispatch(...)`
  function — the script explicitly relies on staying a classic script so
  that `ACTION` and `dispatch` remain reachable from the delegated click
  handler.
- The entire state-change path is a single, unconditional cycle: a click
  invokes `dispatch`, whose `switch` statement mutates state for the
  matched `ACTION` case (or returns early on an unrecognized action), then
  every matched case falls through to a shared tail that increments the `cc`
  click counter and calls `render()` to update the DOM.

Before any refactor of this file proceeds, we need to record which of the two
architectural directions below has been chosen, since they are mutually
exclusive starting points for future work.

### Fork A — Stay single-file

Keep `counter.html` as a single file with no build tooling and no module
system. Internal restructuring is still possible (for example, wrapping the
script in an IIFE for scoping), but there is no bundler, no `package.json`,
and no ES modules.

- Trade-off: preserves zero-dependency portability — the file can be opened
  directly in a browser or copied anywhere with no install step — at the cost
  of continuing to rely on global scope and manual wiring for structure.

### Fork B — Introduce a build step

Introduce a build step (e.g. esbuild, Vite, or similar), adopt ES modules,
and give the project a real entry point (and a `package.json`).

- Trade-off: improves testability and maintainability (modules can be
  unit-tested in isolation, dependencies become explicit imports) at the
  cost of introducing a toolchain dependency and losing the "open the file
  directly" portability of the current design.

## Decision

We will pursue **Fork A: stay single-file**.

Rationale: `counter.html` is a small, self-contained demo/utility widget with
no current requirement for automated testing infrastructure or external
dependencies. The zero-dependency portability of a single file that can be
opened directly in a browser — with no install step, no toolchain, and no
`package.json` — outweighs the testability benefits a build step would bring
for a widget of this size. Any future internal restructuring (e.g. IIFE
scoping) must not introduce a bundler, a module system, or a `package.json`.

## Consequences

- Future refactors of `counter.html` must preserve the no-build-step,
  no-module-system, single-file constraint.
- `ACTION` and `dispatch` (or their replacements) must remain reachable
  from wherever click handling is wired, without relying on a module loader.
- If testability needs grow substantially in the future, that would be a
  reason to revisit this decision and consider Fork B — but that revisit
  should itself produce a new ADR rather than an ad-hoc change.

## Amendment (2026-07-21)

The Context, Fork A, and Consequences sections above were updated to
describe the wiring mechanism as actually implemented: buttons carry a
`data-action` attribute, a single delegated `addEventListener` on
`#counter` reads `event.target.dataset.action` and calls `dispatch(x)`.
Earlier prose described an inline `onclick="doOperation(ACTION.X)"` wiring
and framed the delegated listener as a possible future refactor; both have
since been implemented in `counter.js`/`counter.html`, so this amendment
brings the ADR's description in line with the code. This amendment does not
change `Status: Accepted` or the Fork A decision itself.

## Amendment (Fork A+ — CDN-delivered React exception)

`counter.js`/`counter.html` have been rewritten to use React with
`useReducer` instead of hand-rolled `dispatch`/`render` functions. This is
recorded as **Fork A+**, a narrow, explicitly-scoped exception to Fork A
rather than a reversal of the Fork A decision or an adoption of Fork B:

- React and ReactDOM are loaded via `<script src>` tags from a CDN
  (unpkg/cdnjs) — the same "no build step, no bundler, no `package.json`"
  constraint from Fork A still holds, since nothing is installed or bundled
  locally.
- Babel standalone is loaded the same way (CDN `<script src>`) and performs
  an in-browser JSX/JS transform at page-load time.
- Component code lives inline in `counter.html`, inside a single
  `<script type="text/babel">` block, in place of the former
  `counter.js`/`<script src="counter.js">` pairing.

This exception is accepted **only** with the following three hard,
non-negotiable costs on record — this is not a free upgrade, and any of
these becoming unacceptable in this widget's deployment context is grounds
to abandon Fork A+ in favor of Fork B or a new ADR, not to silently work
around them:

1. **Babel weight.** Babel standalone's in-browser transform adds roughly
   1 MB of script weight to the page. This is unsuitable for any
   production or performance-sensitive context — it is acceptable here only
   because this remains a small demo/utility widget, not a general
   precedent for other pages.
2. **CSP / `unsafe-eval` incompatibility.** The in-browser Babel transform
   requires `unsafe-eval` and/or `unsafe-inline` script execution. Any
   deployment context that has, or may in the future adopt, a strict
   Content-Security-Policy will have this widget **silently stop working**
   (no visible error, no console-surfaced failure a typical user would see)
   under that policy. If such a CSP is in force or is ever planned, Fork A+
   is disallowed for that context — Fork B (a real build step, precompiled
   output) or a new ADR is required instead.
3. **File-collapse regression.** Folding `counter.js` into an inline
   `<script type="text/babel">` block inside `counter.html` collapses two
   files back into one. This is a structural regression against the
   file-separation that existed before this amendment, and is recorded here
   as an accepted cost of Fork A+, not an incidental side effect.

This amendment does not change the Fork A decision for any future
non-React work on this file: Fork B (bundler, ES modules, `package.json`)
remains rejected outside of this narrow, named exception.
