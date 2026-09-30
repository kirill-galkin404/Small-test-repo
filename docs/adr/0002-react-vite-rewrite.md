# 2. React + Vite rewrite of the counter widget

## Status

Accepted

## Context

[ADR 0001](./0001-single-file-vs-build-step.md) ("Single-file vs. build-step
architecture for counter.html") recorded a decision between two mutually
exclusive forks for the counter widget's architecture:

- **Fork A — stay single-file**: no build step, no bundler, no module
  system, no `package.json`.
- **Fork B — introduce a build step**: adopt a bundler (e.g. esbuild or
  Vite), ES modules, and a real entry point.

ADR 0001 chose Fork A, and that decision held for as long as `counter.html`
remained a small, self-contained demo widget with no requirement for
automated testing infrastructure.

That has changed: the counter widget is now being rewritten as a React
component, built and served via Vite (`package.json`, `vite.config.js`, and
`src/main.jsx` already exist as the scaffold for this rewrite). A React
component tree requires JSX compilation, a module system, and a bundler —
none of which are compatible with ADR 0001's Fork A constraints ("Future
refactors of `counter.html` must preserve the no-build-step,
no-module-system, single-file constraint").

## Decision

This ADR **supersedes ADR 0001's Fork A decision** and adopts **Fork B**:
the project now has a real build step (Vite), a module system (ES modules /
JSX via `@vitejs/plugin-react`), and a `package.json`.

Concretely:

- `index.html` (repo root) is now the real Vite entry point: it contains a
  `<div id="root"></div>` and loads `/src/main.jsx` as an ES module. It no
  longer redirects to `counter.html`.
- The old `counter.html` (the hand-written, script-tag counter widget) is
  removed from the repo root. Its URL is preserved for compatibility as
  `public/counter.html` — a static file that Vite copies verbatim into
  `dist/` on build (and serves as-is in dev mode) — which redirects visitors
  to `index.html`.
- Future work on the counter widget happens as React components under
  `src/`, built and bundled by Vite, not as edits to a single hand-written
  HTML/JS file.

Rationale: the counter widget rewrite to React + Vite is a hard requirement
that cannot be satisfied within ADR 0001's no-build-step, no-module-system
constraints. Rather than editing ADR 0001 to reflect a decision it
explicitly reversed, this new ADR records the reversal and supersedes ADR
0001's Fork A choice, per ADR 0001's own guidance that "that revisit should
itself produce a new ADR rather than an ad-hoc change."

ADR 0001 itself is left unedited as the historical record of the original
decision and its rationale at the time.

## Consequences

- `index.html` is the canonical entry point going forward; it is processed
  by Vite's HTML pipeline (asset resolution, module script injection).
- `counter.html` no longer exists as a hand-written widget at the repo
  root. `public/counter.html` exists solely to keep the old URL resolving,
  via a redirect to `index.html`; it carries no application logic.
- Everything under `public/` is copied by Vite into `dist/` unmodified, so
  `public/counter.html` becomes `dist/counter.html` on build without being
  parsed or transformed by Vite.
- New widget behavior (increment/decrement/reset/etc.) is implemented as
  React components under `src/`, not as global `ACTION`/`dispatch` wiring
  in a classic script tag.
