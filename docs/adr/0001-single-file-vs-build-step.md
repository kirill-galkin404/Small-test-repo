# 1. Single-file vs. build-step architecture for counter.html

## Status

Accepted

## Context

`counter.html` is the page entry point, and it is deliberately kept free of
build tooling:

- There is no build step, no bundler, and no `package.json` anywhere in the
  repository.
- There is no module system: `counter.js` is an external classic
  (non-module) script, loaded by `counter.html` via `<script src="counter.js">`,
  and `style.css` is an external stylesheet loaded via `<link rel="stylesheet">`.
  Both are plain assets served alongside `counter.html`; neither is generated.
- Behavior is wired via a `data-action` attribute on each button (e.g.
  `data-action="INCREMENT"`), read by a single event-delegated
  `addEventListener("click", ...)` registered on the `#counter` container.
  The handler resolves the button with `event.target.closest("[data-action]")`
  (so clicks on nested elements still work), looks up
  `button.dataset.action` in the global, frozen `ACTION` object, and calls
  the global `dispatch(...)` function — the script explicitly relies on
  staying a classic script so that `ACTION` and `dispatch` remain reachable
  from the delegated click handler.
- The entire state-change path is a single, unconditional cycle: a click
  invokes `dispatch`, whose `switch` statement mutates state for the
  matched `ACTION` case (or returns early on an unrecognized action), then
  every matched case falls through to a shared tail that increments the `cc`
  click counter and calls `render()` to update the DOM.

Before any refactor of this file proceeds, we need to record which of the two
architectural directions below has been chosen, since they are mutually
exclusive starting points for future work.

### Fork A — Stay single-file

Keep `counter.html` and its external classic assets (`counter.js`,
`style.css`) with no build tooling and no module system. Internal
restructuring is still possible (for example, wrapping the
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
  no-module-system, single-file constraint. Fork A means no build tooling:
  `counter.js` and `style.css` stay hand-written, external classic assets.
- `ACTION` and `dispatch` (or their replacements) must remain reachable
  from wherever click handling is wired, without relying on a module loader.
- If testability needs grow substantially in the future, that would be a
  reason to revisit this decision and consider Fork B — but that revisit
  should itself produce a new ADR rather than an ad-hoc change.

## Amendment (2026-07-21)

The Context, Fork A, and Consequences sections above were updated to
describe the wiring mechanism as actually implemented: buttons carry a
`data-action` attribute, a single delegated `addEventListener` on
`#counter` resolves the button with `event.target.closest("[data-action]")`
and calls `dispatch(ACTION[button.dataset.action])`.
Earlier prose described an inline `onclick="doOperation(ACTION.X)"` wiring
and framed the delegated listener as a possible future refactor; both have
since been implemented in `counter.js`/`counter.html`, so this amendment
brings the ADR's description in line with the code. This amendment does not
change `Status: Accepted` or the Fork A decision itself.

## Amendment (2026-11-04)

The Context described the page as one self-contained file with its script
embedded in the HTML and no separate assets, which does not match the code: `counter.js` is
an external classic script loaded by `counter.html` via `<script src>`, and
`style.css` is an external stylesheet. This amendment corrects that wording
and defines "single-file" as used by this ADR: no build step and no module
system, with `counter.js` and `style.css` as external classic assets alongside
`counter.html`. The delegated handler description was likewise corrected to
`event.target.closest("[data-action]")`. `Status: Accepted` and the text of the
Decision section are unchanged.
