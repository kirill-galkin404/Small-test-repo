# 2. Scope of build tooling in the monorepo

## Status

Accepted

## Context

[ADR 0001](0001-single-file-vs-build-step.md) chose to keep `counter.html`
single-file, with no bundler, no module system and no `package.json`. That
decision was written when the repository contained only the counter widget.

The repository is becoming a monorepo that also hosts two applications moved
in from separate repositories: `todo-frontend` and `todo-backend`. Both need a
`package.json`, dependency management and (for the frontend) a bundler. ADR
0001's "no `package.json` anywhere" wording was about the counter widget, not
about unrelated packages, but the two must be reconciled explicitly.

## Decision

- `package.json` files and bundlers are permitted in exactly three places:
  the repository root, `todo-frontend/` and `todo-backend/`.
- The packages are managed as npm workspaces from the root `package.json`,
  with a single root `package-lock.json`. Per-package lockfiles are not
  committed. `concurrently` is used at the root to run the apps together
  for development.
- `counter.html` and `counter.js` remain single-file artifacts: no bundler,
  no module system, no build step, and no dependency on any workspace
  package. ADR 0001 (Fork A) continues to govern them unchanged.
- The root `index.html` and `style.css` are likewise untouched, and no
  bundler is applied to them.

## Consequences

- Build tooling must not be introduced outside the three locations above
  without a new ADR.
- The root `package.json` and workspace tooling must not process, bundle, or
  rewrite the counter widget files.
- `counter.html` can still be opened directly in a browser with no install
  step.
- ADR 0001 is not superseded or amended by this ADR; it is narrowed in
  practical scope only in that "no `package.json`" applies to the counter
  widget, not to the new packages.
