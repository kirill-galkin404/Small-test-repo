# RULES.md

This document is the single source of truth for the counter app's business
rules. `README.md` links here instead of restating any of this text, and the
extracted rule modules under `src/rules/` implement exactly what is
described below (see the Vitest suites alongside each module for the
executable spec).

## 1. Arithmetic actions

The counter widget exposes five actions, each applying an exact delta to the
current counter value `c`. Values are unrestricted — there is no lower or
upper bound.

| Action      | Effect on `c`     | Module function                        |
| ----------- | ----------------- | --------------------------------------- |
| INCREMENT   | `c = c + 1`        | `src/rules/arithmetic.js#increment`     |
| DECREMENT   | `c = c - 1`        | `src/rules/arithmetic.js#decrement`     |
| RESET       | `c = 0`             | `src/rules/arithmetic.js#reset`         |
| ADD_FOUR    | `c = c + 4`        | `src/rules/arithmetic.js#addFour`       |
| DOUBLE      | `c = c * 2`        | `src/rules/arithmetic.js#double`        |

RESET always sets `c` to `0`, regardless of its current value.

## 2. Dispatch validation and click accounting

A **click** on the counter widget and a **dispatch** are not the same thing:

- A click only becomes a dispatch if the clicked element carries a
  recognized `data-action` attribute (one of the five actions above). Clicks
  on anything else inside the widget are silently ignored — no state
  changes, no counting.
- If a dispatched action code does not match any of the five recognized
  actions, the dispatch has no effect: no change to `c`, no increment to the
  dispatch counter `cc`, and no re-render.
- The displayed dispatch counter `cc` increases by exactly 1 only when a
  recognized action is successfully dispatched. `cc` counts recognized
  dispatches, not raw clicks.

Implemented by `src/rules/dispatch.js#dispatch`.

## 3. Color thresholds

The counter value's display color is derived purely from its numeric value,
with exact boundaries:

- `c > 10` → **red**
- `c < 0` → **blue**
- otherwise (`0 <= c <= 10`, including both boundaries) → **black**

Boundary values `c = 0` and `c = 10` both render black.

Implemented by `src/rules/color.js#colorForValue`.

## 4. Entry-point redirect

Visiting the site root (`/`) redirects the visitor to the counter view
immediately, with no delay.

Implemented by `src/rules/routing.js#getEntryRedirectTarget`.
