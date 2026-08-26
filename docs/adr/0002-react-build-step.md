# 2. React build step for the counter widget

## Status

Accepted

This ADR **supersedes** [ADR 0001: Single-file vs. build-step architecture
for counter.html](0001-single-file-vs-build-step.md), which decided to
pursue Fork A (stay single-file). That decision is reversed here.

## Context

ADR-0001 decided to keep `counter.html` as a single, dependency-free file
with no bundler, no module system, and no `package.json` (Fork A), on the
grounds that the widget was too small to justify a toolchain.

A new requirement changes that calculus: the counter widget is being
ported to React, and the port must be accompanied by demonstrable parity
with the original vanilla-JS behavior (see
[docs/parity-spec.md](../parity-spec.md)) via unit-tested logic. React
itself requires JSX compilation, and producing unit-testable, isolated
modules (rather than globals reachable only via a classic `<script>` tag)
requires a real module system. Neither is achievable under Fork A's
constraints.

## Decision

We will pursue **Fork B: introduce a build step**, as originally described
in ADR-0001: adopt Vite as the build tool, ES modules as the module system,
and a `package.json` to declare dependencies (React, Vite, Vitest, and the
Vite React plugin).

Rationale: the React requirement and the need to demonstrably prove
behavioral parity via unit tests both require capabilities Fork A
explicitly ruled out (a bundler/JSX compiler and a module system with
unit-testable, isolated modules). Fork B directly provides both.

## Consequences

- Node.js and npm are now required to develop the project; the previous
  "open the file directly in a browser" workflow no longer works for
  development.
- The project loses the zero-install, copy-anywhere portability of a
  single static HTML file — cloning the repo alone is no longer sufficient
  to run it from disk.
- A build artefact (`npm run build`'s output) is now required to produce
  what is served by hosting; the source (`src/`, `index.html` as a Vite
  entry) is no longer directly deployable as-is.
- `package.json`, `vite.config.js`, and the `src/`/`test/` module structure
  are introduced as the new toolchain (see docs/parity-spec.md for the
  behavioral contract these modules must satisfy).
- ADR-0001's Fork A decision and its consequences no longer apply to this
  project; any future work should treat this ADR as the current
  architectural baseline instead.
