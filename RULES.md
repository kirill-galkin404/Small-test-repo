# Counter Widget — Business Rules

This document describes the behavior of the counter widget as implemented
today (`src/counterReducer.js` and `src/colorForValue.js`). It is business-rule
documentation, not implementation code.

## Actions and arithmetic

The widget exposes exactly five recognized actions, dispatched by the five
buttons in the UI:

- **R-0001 — INCREMENT (`+` button):** Increases the counter value by exactly 1.
- **R-0002 — DECREMENT (`-` button):** Decreases the counter value by exactly 1.
- **R-0003 — RESET (`reset` button):** Sets the counter value back to `0`,
  regardless of what the current value was (positive or negative).
- **R-0004 — ADD_FOUR (`+4` button):** Increases the counter value by exactly 4.
- **R-0005 — DOUBLE (`x2` button):** Multiplies the current counter value by 2.
  This includes negative values, which become **more negative** (e.g. `-3` →
  `-6`), and zero, for which doubling is a no-op (`0` → `0`). This
  further-from-zero behavior for negative values is **intentional and
  documented**, not a bug — it is simply subject to the same `-20..20` bound
  as every other action (see below).

## Value bound (clamp)

Every action's resulting value — INCREMENT, DECREMENT, RESET, ADD_FOUR, and
DOUBLE alike — is clamped to the inclusive range **-20 to 20**. If an
operation's raw arithmetic result would fall outside that range, the stored
value is capped at `-20` (low end) or `20` (high end) instead. This is the
fix for the previous defect where the counter could grow unbounded.

## Dispatch guard

- **R-0008:** If an `action.type` does not match one of the five known
  actions (INCREMENT, DECREMENT, RESET, ADD_FOUR, DOUBLE), the reducer
  returns the state unchanged — neither `value` nor `clickCount` is mutated.
  Only these five recognized actions are able to mutate state or count as a
  "click" against the widget.
- **R-0009:** The click count shown in the title/heading counts only
  dispatches that matched one of the five recognized actions above, not
  every click event that occurs on the page.
- **R-0007:** Clicks that don't land on one of the five action buttons (e.g.
  the heading text, the number display, or the container padding) are
  ignored and never reach the reducer. There is no delegated/bubbled click
  listener on the container anymore — each button wires its own handler
  directly, so clicks outside the five buttons naturally do nothing. This is
  documented as the current, intended behavior.

## Color thresholds

- **R-0006 [change]:** The displayed counter number is colored based on its
  current value, via `colorForValue`:
  - **`high` (red):** value is strictly greater than 10 (i.e. 11 and above).
  - **`low` (blue):** value is negative (less than 0).
  - **`normal` (black):** value is 0 through 10, inclusive.

  The reducer/color function itself only produces the token (`high`, `low`,
  `normal`); the actual color values applied on screen (including light/dark
  palette variants) live in `src/theme.css`, which maps each token to its
  concrete color per the active palette.

## Persistence

Counter state (`value` and `clickCount`) is **not persisted** anywhere —
there is no `localStorage`, cookie, or server-side persistence involved.
Refreshing or reloading the page resets the widget to its initial state:
`value = 0`, `clickCount = 0`.
