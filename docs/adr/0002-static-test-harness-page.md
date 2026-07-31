# 2. Static, no-build-step test harness page for counter.js

## Status

Accepted

## Context

`docs/adr/0001-single-file-vs-build-step.md` decided to keep `counter.html`
single-file, dependency-free, with no build step, no bundler, and no module
system — and explicitly noted that any future testability-driven
restructure "should itself produce a new ADR rather than an ad-hoc change."

Today there is no automated way to re-verify `counter.js`'s behavior after a
change. The only re-verification method is manually clicking through
`counter.html` in a browser and eyeballing `#d`'s text/colour and `#ttl`'s
text. This has already proven error-prone in this repo's own history (see
PR #30's cross-reference matrix fixing two drifted mismatches) and does not
exercise the loud-failure guards added alongside this ADR (the click
listener's misconfigured-trigger guard and `dispatch()`'s unrecognized-code
guard), since both are exceptional paths that are easy to forget to click
through by hand.

This ADR is scoped narrowly: it revisits ADR 0001 **only on testability**,
for the single purpose of adding a repeatable, in-browser assertion suite.
It does not reopen the single-file/build-step decision itself.

### Fork A — Second plain HTML page, classic script, no tooling

Add a sibling file, `counter.test.html`, that:

- Declares its own DOM fixture mirroring `counter.html` (`#counter`, the
  five buttons, `#d`, `#ttl`).
- Loads the real `counter.js` via a plain `<script src="counter.js">` tag
  (a classic, non-module script — identical to how `counter.html` loads it).
- Contains its own inline `<script>` that calls `dispatch(...)` and reads
  `c`/`cc`/the DOM directly, and renders a visible (not console-only)
  pass/fail list into the page.
- Requires no `package.json`, no test runner, no bundler — it is opened
  directly in a browser exactly like `counter.html` is.

- Trade-off: keeps the zero-dependency, open-the-file-directly portability
  ADR 0001 chose, and gives every case a visible, human-reviewable result,
  at the cost of being a hand-rolled assertion harness (no fixtures/mocking
  library, no CI runner, no machine-readable pass/fail output) rather than
  a real test framework.

### Fork B — Bundler + unit-test runner (rejected)

Introduce a `package.json`, a test runner (e.g. Jest, Vitest), and a
bundler or module system so `counter.js`'s functions could be imported and
unit-tested in isolation.

- Rejected because it directly contradicts ADR 0001's Fork A decision (no
  build step, no bundler, no `package.json`) for a widget of this size, and
  because `ACTION`/`dispatch` must stay reachable as globals from a plain
  `<script>` — see ADR 0001's Consequences.

### Fork C — ES modules (rejected)

Convert `counter.js` to an ES module (`export`/`import`) so a module-aware
test file could `import` it directly.

- Rejected for the same reason as Fork B: it would require `counter.html`'s
  `<script>` tag to become `type="module"`, changing how `ACTION` and
  `dispatch` are wired and reachable, which ADR 0001 explicitly ruled out
  without a new ADR reopening that decision — and this ADR does not reopen
  it.

## Decision

We will pursue **Fork A**: add `counter.test.html` as a second static HTML
page, loading the unmodified `counter.js` via a classic `<script>` tag, with
its own inline script implementing the assertion suite and a visible
pass/fail list. No `package.json`, bundler, test runner, or module system is
introduced.

## Consequences

- `counter.test.html` must be kept in sync with `counter.js` by hand: any
  change to an `ACTION` code, a `render()` threshold, or a DOM id used by
  `counter.js` (`#counter`, `#d`, `#ttl`, `data-action` values) requires a
  matching update to `counter.test.html` in the same commit.
- There is still no CI runner — `counter.test.html` must be opened manually
  in a browser to re-verify; it is a manual-but-repeatable check, not
  continuous automated testing.
- `ACTION`, `dispatch`, `render`, `c`, and `cc` must remain reachable as
  plain global identifiers (not `window.ACTION` etc. for `const`/`let`
  top-level bindings, which are not exposed as `window` properties in
  browsers even in classic scripts) so that `counter.test.html`'s own
  script, loaded after `counter.js` in the same document, can reference
  them directly. This does not change ADR 0001's global-scope wiring.
- This ADR does not change the Decision in ADR 0001: `counter.html` itself
  stays single-file, dependency-free, with no build step. Only the addition
  of a second, equally dependency-free static page for testing is in scope.
