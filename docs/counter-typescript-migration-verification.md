# Manual verification log — counter.ts → counter.js migration

Verification method: `counter.html` was opened via a `file://` URL (no dev
server, no build watcher running) in a real browser (Chromium, driven
headlessly for reproducibility) after compiling `counter.ts` to `counter.js`
with `tsc -p tsconfig.json`. Each of the five buttons was clicked once, in
sequence (state accumulates across clicks, exactly as it would for a real
user), followed by one unrecognized-`data-action` case. `#d`'s text and
color, and `#ttl`'s text, were read after each click.

| Step | Action | `#d` text | `#d` color | `#ttl` text |
|---|---|---|---|---|
| 0 | (initial load) | `0` | *(none set)* | `Counter` |
| 1 | `+` (INCREMENT) | `1` | black | `Counter (1 clicks)` |
| 2 | `+4` (ADD_FOUR) | `5` | black | `Counter (2 clicks)` |
| 3 | `x2` (DOUBLE) | `10` | black | `Counter (3 clicks)` |
| 4 | `+` (INCREMENT) | `11` | **red** | `Counter (4 clicks)` |
| 5 | `reset` (RESET) | `0` | black | `Counter (5 clicks)` |
| 6 | `-` (DECREMENT) | `-1` | **blue** | `Counter (6 clicks)` |
| 7 | unrecognized action (a button's `data-action` temporarily set to `BOGUS`, then clicked) | `-1` (unchanged) | blue (unchanged) | `Counter (6 clicks)` (unchanged) |

Observations:

- Step 4 confirms the `c > 10` → red threshold.
- Step 6 confirms the `c < 0` → blue threshold.
- Steps 1-3 and 5 confirm the `else` → black case.
- Step 7 confirms `dispatch()`'s default case: an unrecognized action hits
  the early `return` before the shared `cc++`/`render()` tail, so `#ttl`'s
  click count (`cc`) is **not** incremented and `#d` is **not** re-rendered
  — behavior identical to the pre-migration `counter.js`.
- `counter.html` was opened directly via `file://` with no server and no
  build watcher; no network request, module resolution, or bundler was
  involved in serving `counter.js`, confirming the migration preserves
  ADR-0001's zero-install portability.

This matches the pre-migration `counter.js` behavior exactly: same five
`ACTION` cases, same color thresholds, same `cc`-based click count, same
early-return-without-render for unrecognized actions.
