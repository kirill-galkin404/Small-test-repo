# RULES.md — Verified Behavior of counter.js

This document is the single source of truth for the counter widget's
business rules. It was written from a direct, line-by-line reading of
`counter.js` (the actual implementation), not from `README.md`, which
currently contains inaccuracies described below.

## Where the logic actually lives

**Historical note:** the business rules on this page were originally
verified against a pre-rewrite implementation in which the widget's
entire behavior lived in one **external** JavaScript file, `counter.js`,
loaded by `counter.html` via `<script src="counter.js"></script>` — a
separate, external `.js` file referenced by `src`, **not** an inline
`<script>` block embedded in `counter.html` (the original `README.md`
incorrectly claimed the latter).

That `counter.js` file has since been **deleted** as part of the React
rewrite. The same behavior now lives in two files, both loaded by
`counter.html` via external `<script src="...">` tags (still no inline
script, and still no bundler):

- `src/counterReducer.js` — a pure `(state, actionType) => nextState`
  function implementing the five action formulas below.
- `src/CounterApp.js` — the React component tree (built with
  `React.createElement`, no JSX) that wires the five buttons and the
  dark-theme toggle to that reducer via `useReducer`.

The formulas, thresholds, and policies documented below are unchanged
by the rewrite — only their implementation moved.

## State shape

The widget's entire state is exactly two variables:

- `c` — the counter's numeric value, initialized to `0`.
- `cc` — a dispatch/click counter, initialized to `0`, displayed in
  the title as "Counter (N clicks)".

There is no third, intermediate, or scratch variable anywhere in the
state. `README.md` currently claims the state includes an additional
scratch-style variable beyond `c` and `cc` — that claim is incorrect.
The state is `{c, cc}` and nothing else.

## Action formulas (R-0001 through R-0005)

Each action is dispatched by clicking a button with a matching
`data-action` attribute, which triggers `dispatch(ACTION.<NAME>)` and
applies exactly one formula to `c`:

- **R-0001 — INCREMENT (`+` button):** `c = c + 1`. Increases the
  value by exactly 1.
  - Example: `c = 5` → click `+` → `c = 6`.

- **R-0002 — DECREMENT (`-` button):** `c = c - 1`. Decreases the
  value by exactly 1. There is no lower bound — `c` can go negative
  and keeps decreasing indefinitely.
  - Example: `c = 0` → click `-` → `c = -1`.

- **R-0003 — RESET (`reset` button):** `c = 0`, unconditionally,
  regardless of the current value of `c`. Resetting `c` does **not**
  reset `cc`; the dispatch/click counter keeps counting from wherever
  it was.
  - Example: `c = 27`, `cc = 4` → click `reset` → `c = 0`, `cc = 5`
    (cc still increments for the RESET dispatch itself, per R-0008).

- **R-0004 — ADD_FOUR (`+4` button):** `c = c + 4`. Increases the
  value by exactly 4.
  - Example: `c = 3` → click `+4` → `c = 7`.

- **R-0005 — DOUBLE (`x2` button):** `c = c * 2`. Multiplies the
  value by exactly 2.
  - Example: `c = 6` → click `x2` → `c = 12`.

## Display color thresholds (R-0006)

After any successful action, the displayed value's text color is
set based on the new value of `c`:

- `c > 10` → **red**.
- `c < 0` → **blue**.
- `0 <= c <= 10` (inclusive on both ends) → **black**.

Boundary cases are explicitly black, not red or blue:

- `c = 0` renders **black** (it is not `< 0`).
- `c = 10` renders **black** (it is not `> 10`).

## No-op clicks (R-0007)

A click is a complete no-op — no mutation of `c`, no increment of
`cc`, and no re-render — in either of these cases:

- The click target has no `data-action` attribute at all (for
  example, clicking the `#ttl` title element, which carries no
  `data-action`). The click handler returns immediately without
  calling `dispatch` at all.
- The click target has a `data-action` value that does not map to
  any of the five recognized actions (`INCREMENT`, `DECREMENT`,
  `RESET`, `ADD_FOUR`, `DOUBLE`). `dispatch` falls into its `default`
  case, logs a warning, and returns immediately — before `cc` is
  incremented and before `render()` is called.

## Dispatch counting policy (R-0008)

`cc` increments by exactly 1 for every **successfully dispatched**
action — that is, every time `dispatch` matches one of the five
recognized cases (INCREMENT, DECREMENT, RESET, ADD_FOUR, or DOUBLE)
and falls through to the shared `cc++` and `render()` at the end of
the function. This holds regardless of which of the five actions was
dispatched, including RESET.

- `cc` never decreases.
- `cc` is never reset by any action, including RESET — RESET only
  sets `c = 0`; it has no effect on `cc` beyond the same `cc++` every
  other successful action also triggers.
- An unrecognized or absent action (see R-0007) does not increment
  `cc`, since the `default` case in `dispatch` returns before reaching
  the shared `cc++`.
