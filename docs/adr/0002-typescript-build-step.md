# 2. TypeScript build step for counter.html

## Status

Accepted

## Supersedes

[0001-single-file-vs-build-step.md](0001-single-file-vs-build-step.md), which
chose **Fork A: stay single-file** — no build step, no bundler, no module
system, no `package.json`.

## Context

ADR 0001 recorded that `counter.html`/`counter.js` would stay a zero-toolchain,
single-file widget (Fork A), and explicitly required any future revisit of
that choice to be recorded in a new ADR rather than an ad-hoc change. This is
that ADR.

The motivation for revisiting Fork A is testability: hand-verifying
`counter.js`'s five behaviours (`dispatch`, `render`, click delegation,
frozen `ACTION` codes, and in-memory-only state) on every change does not
scale, and the codebase gained a browser-run behaviour-lock harness
(`counter.test.html` + `scripts/run-behavior-harness.js`) specifically to
freeze those behaviours. Adding static types on top of that harness gives a
second, compile-time layer of protection against regressions, at the cost of
introducing a toolchain.

## Decision

We introduce a **minimal** TypeScript build step:

- The source of truth for `counter.js`'s behaviour is now `counter.ts`,
  type-checked with `tsc` (`npx tsc --noEmit`) and compiled with `tsc` to
  the committed `counter.js` at the repo root.
- `package.json` lists `typescript` as the only dependency, with a `build`
  script that invokes `tsc`.
- `tsconfig.json` targets browser-global, non-module output (no `import`/
  `export` emitted), so the compiled `counter.js` is a classic script,
  identical in shape to the hand-written original.
- `counter.js` remains the file `counter.html` loads, via the same
  `<script src="counter.js"></script>` tag as before — untouched by this
  change.
- `counter.js` is a **committed, generated artefact**: it is produced by
  `npm run build` and checked into source control like the rest of the
  repository, and CI runs a drift check (`git diff --exit-code counter.js`
  after a fresh build) to fail the build if the committed file and the
  freshly compiled output disagree. It is not hand-edited; `counter.ts` is.

This supersedes Fork A's "no build step, no bundler, no module system, no
`package.json`" constraint. It does **not** touch Fork A's underlying
concerns about avoiding heavier tooling: there is still no bundler, no
runtime framework, and no in-browser module loader. The toolchain is `tsc`
alone (optionally paired with `esbuild` only if a non-module, browser-global
emission ever needs help beyond what `tsc`'s own `module: "none"`-style
output provides); this ADR does not adopt Vite, webpack, or any runtime
dependency.

## Consequences

- The following invariants from ADR 0001 survive this change and continue to
  bind future work:
  - No runtime framework is introduced; the compiled output stays a plain
    classic `<script>`.
  - No in-browser module loader or bundler-driven `import`/`export` runtime
    behaviour is introduced; the compiled `counter.js` emits no
    `import`/`export` statements.
  - No server is introduced; the widget stays static.
  - `ACTION` and `dispatch` (and `render`) stay reachable as globals from
    wherever click handling is wired — the compiled output explicitly
    assigns `window.ACTION` and `window.dispatch` so this holds regardless
    of how `tsc` would otherwise emit top-level `const`/`function`
    declarations.
- `counter.html` requires no change: its script tag keeps pointing at
  `counter.js`, and opening it directly in a browser still needs no install
  step.
- Contributors editing counter behaviour now edit `counter.ts`, run
  `npm run build`, and commit the resulting `counter.js` alongside it; CI's
  drift check enforces that the two never diverge.
- `npm install` (for `typescript`) is now required only for contributors who
  change `counter.ts` or run the toolchain locally — end users opening
  `counter.html`/`counter.test.html` in a browser still need no install
  step.
- If testability needs grow further (e.g. a real test runner, more source
  files, a bundler), that is a reason to revisit this decision with another
  new ADR, per the same practice ADR 0001 established.
