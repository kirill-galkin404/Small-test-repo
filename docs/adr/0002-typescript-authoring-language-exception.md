# 2. TypeScript-as-authoring-language exception to ADR-0001's no-package.json axis

## Status

Accepted

Supersedes: [ADR-0001](0001-single-file-vs-build-step.md) — but only on the
single axis of "no `package.json`, no toolchain". Every other guarantee in
ADR-0001 (no bundler, no ES module system, no framework, no test runner,
`counter.html` opens directly from a filesystem path with no install step,
`ACTION`/`dispatch` reachable as globals from the delegated click handler)
remains fully in force and unchanged.

## Context

ADR-0001 chose Fork A ("stay single-file") and, as part of that decision,
ruled out any `package.json` or toolchain dependency. Since then we want to
author `counter.js`'s logic in TypeScript for compile-time type safety
(catching, for example, indexing `ACTION` with an unvalidated string, or
reading `.dataset` off a bare `EventTarget`), without giving up any of the
zero-install, open-from-disk guarantees ADR-0001 protects.

TypeScript itself requires a compiler (`tsc`) and therefore a
`package.json` to declare that dev-time dependency. That is a direct
conflict with ADR-0001's "no `package.json` anywhere in the repository"
constraint — but it is a conflict on exactly one axis (toolchain-for-authoring),
not on the axes that matter for the widget's end users (no build step to
*run* the page, no bundler, no ES modules, no framework).

## Decision

We introduce a `package.json` whose **sole devDependency is `typescript`**,
and whose only purpose is to compile a new TypeScript source file into the
JavaScript the browser actually loads. Concretely:

- **`counter.ts` is the source of truth.** All logic (the `ACTION` union,
  `dispatch`, `render`, DOM lookups) is authored in `counter.ts`.
- **`counter.js` is a generated file.** It is produced by running `tsc`
  against `counter.ts` and is committed to the repository, but it must
  **never be hand-edited** — any change to behavior goes through
  `counter.ts` and is re-compiled.
- **`counter.ts` must not contain `import` or `export` statements.**
  `tsconfig.json` configures a module-free, single-file `--outFile` emit
  (see `tsconfig.json`); this only works if the source has no ES module
  syntax. `ACTION` and `dispatch` therefore continue to be reachable as
  plain globals, exactly as ADR-0001's Consequences section requires —
  `tsc`'s output is still a classic (non-module) script.
- **A dev/CI-only diff check** (`tsc` followed by
  `git diff --exit-code counter.js`) guards against `counter.js` drifting
  from what `counter.ts` actually compiles to. This check runs in
  development or CI only; it is never a prerequisite for opening
  `counter.html`.
- **No bundler, ES module system, framework, or test runner is
  introduced.** `npm install` pulls down exactly one dev-time tool
  (`typescript`) used to produce a plain script; it does not change what
  ships to the browser or how the page is opened.

## Consequences

- `counter.html` keeps opening directly from a `file://` path with zero
  install step: the committed `counter.js` is plain, already-compiled
  JavaScript, so a browser never needs Node, npm, or `tsc` to run the page.
- Contributors who want to change widget behavior edit `counter.ts`, run
  `npm run build` (or `npm run verify:generated`), and commit the
  resulting `counter.js` alongside their `counter.ts` change in the same
  commit.
- `counter.js` must never be edited by hand; any hand-edit will be
  overwritten (and caught as drift) the next time someone runs the diff
  check.
- Adding a test runner, a bundler, or ES modules remains out of scope for
  this ADR and would require its own future ADR, exactly as ADR-0001
  already anticipated for any larger toolchain change.
