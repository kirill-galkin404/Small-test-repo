# 2. Bounded tsc-only compile step for counter.ts -> counter.js

## Status

Accepted

## Context

ADR 0001 established that `counter.html` stays single-file, single-script,
with no build step, no bundler, no ES module system, and no `package.json`.
Since then, the click-handling and rendering code in `counter.js` has grown
seams that would benefit from static typing: the `dataset.action` -> `ACTION`
lookup in the delegated click handler, and the three nullable
`document.getElementById` handles used for wiring and rendering.

ADR 0001 explicitly anticipates this kind of revisit: "If testability needs
grow substantially in the future, that would be a reason to revisit this
decision ... but that revisit should itself produce a new ADR rather than an
ad-hoc change." This ADR is that revisit. It does not reopen the Fork A vs.
Fork B choice; it narrows the question to whether a type-checker compile
step (with no runtime module system) is compatible with Fork A.

## Decision

We add a single `tsconfig.json` and rename the hand-authored source from
`counter.js` to `counter.ts`, adding types only at the two risky call sites
identified above (plus the `ACTION` union and the `c`/`cc` state
variables). `tsc` is invoked directly, with `module: "none"` and
`outFile: "counter.js"`, compiling `counter.ts` back into a single classic
(non-module) script committed as `counter.js`.

This is a narrow exception to ADR 0001, not a reversal of it:

- No `package.json` is introduced. `tsc` is invoked directly from the
  sandbox/CI shell.
- No bundler is introduced.
- No ES module system is introduced — `module: "none"` keeps the emitted
  script a classic global script, matching the current runtime contract
  (`ACTION` and `dispatch` remain reachable exactly as before).
- `counter.js` becomes a **committed, generated file**: it is produced by
  running `tsc -p tsconfig.json` against `counter.ts` and checked into the
  repository, rather than hand-edited. `counter.html`'s
  `<script src="counter.js">` is unchanged and still loads a plain script
  with no install step for anyone opening the file directly — the
  committed `counter.js` is already built.

## Consequences

- Anyone changing counter logic edits `counter.ts` and re-runs
  `tsc -p tsconfig.json`, then commits the regenerated `counter.js`
  alongside it. `counter.js` should not be hand-edited directly.
- `module: "none"` + `outFile` are on a documented deprecation path in the
  TypeScript compiler (require `"ignoreDeprecations": "6.0"` on the
  compiler version used here) and may need revisiting if a future
  compiler version removes them outright.
- `strict: true` is enabled for compile-time checking, but `alwaysStrict`
  is set to `false` so the emitted script does not gain a `"use strict"`
  prologue that wasn't in the original file, keeping the generated output
  close to pure type erasure.
- `var c` / `var cc` (which attached `c` and `cc` to the global object in
  the pre-migration script) become `let c` / `let cc` (which do not).
  Nothing in this repository references `window.c` or `window.cc`, so this
  is accepted as a low-risk, documented behavioural footnote rather than a
  blocker.
- No `package.json`, bundler config, or module system exists in the repo
  after this change — Fork A from ADR 0001 remains in force.
