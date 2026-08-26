# 2. Compile counter.html's script from TypeScript via a pinned tsc install

## Status

Accepted

## Context

ADR-0001 ("Single-file vs. build-step architecture for counter.html") decided
to keep `counter.html` single-file, with no bundler, no module system, and no
`package.json`. That decision is unchanged. Separately, `counter.js` — the
classic-script widget logic loaded via `<script src="counter.js">` — is being
ported from hand-written JavaScript to typed TypeScript (`counter.ts`) so that
`ACTION`, `dispatch`, and `render` get compile-time type checking.

Introducing TypeScript requires a compile step to turn `counter.ts` into the
`counter.js` that `counter.html` actually loads. This ADR records how that
compile step is provisioned and invoked, without reopening ADR-0001's Fork A
decision.

## Decision

We will extend ADR-0001, not reverse it:

- `tsc` (TypeScript compiler) is installed once as a version-pinned, global
  command-line tool (`npm install -g typescript@<version>` or an equivalent
  standalone binary on PATH). It is never invoked via an npm script or a
  `package.json` "scripts" entry, and no `package.json` is added to the
  repository.
- The pinned compiler used to produce the committed `counter.js` is
  **TypeScript 6.0.2** (`tsc -v` reports `Version 6.0.2`).
- The compile step is a manual, one-time (or as-needed) invocation:
  `tsc -p tsconfig.json`, run from the repository root. `tsconfig.json` pins
  `"target": "ES2015"`, `"strict": true`, and `"module": "none"` with no
  `outFile`, so `tsc` emits a plain per-file, global-scope `counter.js` next
  to `counter.ts` — the same classic-script shape ADR-0001 requires.
- The emitted `counter.js` is committed to the repository as a build
  artifact, exactly like the hand-written file it replaces. There is no
  CI-only or install-time build; `counter.html`'s
  `<script src="counter.js">` tag keeps loading a file that already exists
  in the repository.

`ACTION`, `dispatch`, and `render` remain declared at the top level of the
compiled `counter.js` (no module wrapper, no `System.register`/`define`/
`exports.` markers), so they stay reachable from the delegated `#counter`
click handler exactly as ADR-0001's Consequences section requires, without
relying on a module loader.

## Consequences

- Anyone changing widget behavior edits `counter.ts` and re-runs
  `tsc -p tsconfig.json` to regenerate the committed `counter.js`; the two
  files must be kept in sync by convention, since there is no build step
  wired into installs or CI.
- No `package.json`, bundler, or ES module system has been introduced.
  ADR-0001's Fork A decision (single-file, no build tooling, no module
  system) still stands; this ADR only adds a manual, pinned compile step for
  the TypeScript source that produces the same kind of classic-script output
  ADR-0001 already required.
- If a future change needs an installable/CI-wired build pipeline (for
  example, running `tsc` automatically via a package manager script), that
  is a bigger step back toward ADR-0001's rejected Fork B and should get its
  own ADR rather than an ad-hoc change here.
