# Manual re-check script for counter.js

`counter.test.html` (see
[docs/adr/0002-static-test-harness-page.md](adr/0002-static-test-harness-page.md))
is the repeatable re-verification suite for `counter.js`. There is no CI
runner for it — re-running it is a manual step.

## When to run it

Open `counter.test.html` directly in a browser (no server needed) after
**every** change to `counter.js`, and before merging that change:

1. Open `counter.test.html`.
2. Confirm every case in the visible results list shows `PASS` and the
   summary line reads `N passed, 0 failed`.
3. If any case shows `FAIL`, treat it as a regression: fix `counter.js` (or
   the test itself, if the expected behavior genuinely changed on purpose)
   before proceeding.

## Keeping the harness in sync

Whenever a change to `counter.js` alters any of the following, update
`counter.test.html` in the **same commit**:

- An `ACTION` code or name.
- A `render()` threshold (currently `c > 10` red, `c < 0` blue).
- A DOM id or `data-action` value used by `counter.js` (`#counter`, `#d`,
  `#ttl`, or any button's `data-action`).

`counter.test.html`'s own DOM fixture mirrors `counter.html`'s; if
`counter.html`'s markup changes in a way that affects click routing,
mirror that change in `counter.test.html`'s fixture too.
