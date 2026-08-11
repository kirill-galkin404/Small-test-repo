# 2. Permit a developer-time-only tsc compile step

## Status

Accepted

## Context

ADR-0001 decided Fork A ("stay single-file") for `counter.html`: no bundler,
no module system, no `package.json`, and no build step at all, in exchange
for zero-dependency `file://` portability and the ability to open the file
directly in a browser with no install step.

Since then, the need has arisen to give `counter.js`'s logic (`ACTION`,
`dispatch`, `render`, and the delegated click listener) static, strict type
checking, without abandoning any of the portability guarantees ADR-0001's
Fork A rationale is built on. This ADR narrowly amends ADR-0001 to permit a
`tsc` compile step under tightly scoped conditions, rather than reopening the
Fork A vs. Fork B decision itself. ADR-0001 anticipated this kind of change
should "itself produce a new ADR rather than an ad-hoc change" — this is that
ADR.

This is **not** a revisit of Fork A. It does not introduce a bundler, a
module system, a CDN dependency, or a `package.json`-as-dependency-manifest.
It supersedes only the "no build step at all" clause of ADR-0001; every other
Fork A constraint remains in force.

## Decision

We answer the four questions this change must settle:

**(a) Is a `tsc` compile step permitted at all?**
Yes, but strictly as a developer-time-only tool. `tsc` is never a runtime
dependency: the browser never sees, fetches, or executes any `.ts` file or
TypeScript compiler. Opening `counter.html` via `file://` must continue to
require nothing beyond a browser.

**(b) What output format is permitted?**
A single plain classic (non-module) script — no `import`/`export`, no AMD
or CommonJS wrapper (`Object.defineProperty(exports, ...)`, `require(...)`),
and no IIFE wrapper, since no IIFE is needed to satisfy reachability: a
classic script's top-level function declarations and `const`/`let`
bindings are already reachable from any other top-level statement in the
same file, including the click listener registered in that same file.

**(c) Must the compiled `counter.js` be committed to the repo?**
Yes. `counter.ts` (source) and the `tsc`-compiled `counter.js` (output) are
committed together, in the same change, every time either one changes. The
compiled `counter.js` is never treated as a build-time-only artifact that a
consumer or reviewer must regenerate — it ships in the repo exactly as
today's hand-written `counter.js` does, so the zero-install `file://`
portability that is the entire rationale for Fork A survives unchanged.

**(d) Do `ACTION`, `dispatch`, and `render` remain reachable from the
delegated click wiring exactly as ADR-0001 describes?**
Yes. ADR-0001's 2026-07-21 amendment describes a single
`addEventListener("click", ...)` registered on `#counter`, reading
`event.target.dataset.action`, calling `dispatch(ACTION[action])`. That
wiring is unchanged: `ACTION`, `dispatch`, and `render` are declared at the
compiled script's own top level, and the click listener remains a top-level
statement in that same compiled file — reachability holds lexically, with
no module loader or import graph involved at any point.

## Consequences

- `tsc` may be used at developer time to compile `counter.ts` to
  `counter.js`; it is pinned via a checked-in `tsconfig.json` and invoked
  directly (no `package.json`, no `npx`-triggered network fetch).
- All other Fork A constraints from ADR-0001 remain in force unchanged: no
  bundler, no ES modules, no CDN dependency, no `package.json` used as a
  dependency manifest.
- Every commit that changes `counter.ts` must also update the compiled
  `counter.js` in the same commit, and vice versa — a `counter.ts` change
  without a matching `counter.js` change (or vice versa) is an incomplete
  change.
- This ADR supersedes only the "no build step at all" clause of ADR-0001's
  Fork A decision. It does not reopen, and does not change the outcome of,
  the Fork A vs. Fork B decision itself.
