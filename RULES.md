# Counter Widget — Behavior Parity Spec

This document is the source of truth for the counter widget's current behavior
(as implemented today in `counter.js`), captured **before** any rewrite (e.g.
to Vite/React) so the new implementation can be verified against it for exact
parity. It intentionally documents behavior only — no implementation details.

## 1. State

The widget tracks two independent pieces of state:

- **Counter value** (`c`): the numeric value displayed to the user. Starts at `0`.
- **Click counter** (`cc`): a count of every *successfully matched* dispatched
  action. Starts at `0`. This is **not** the same as the counter value.

## 2. Actions

There are exactly five recognized actions. Each is triggered by a click on an
element carrying the matching `data-action` attribute, and each has an exact,
well-defined effect on the counter value.

| Action      | Trigger             | Effect on counter value            | Rule    |
|-------------|----------------------|-------------------------------------|---------|
| INCREMENT   | Click `+` button     | Increases the value by 1            | R-0006  |
| DECREMENT   | Click `-` button     | Decreases the value by 1 (no lower bound; can go negative) | R-0007 |
| RESET       | Click reset button   | Sets the value to `0`, regardless of current value | R-0008 |
| ADD_FOUR    | Click `+4` button    | Adds 4 to the value in a single step | R-0009 |
| DOUBLE      | Click `x2` button    | Multiplies the current value by 2   | R-0010  |

## 3. Click dispatch rules

- **R-0001 — Click counter increments on every recognized action.** Every
  successfully matched action (increment, decrement, reset, add-four, double)
  increments the click counter (`cc`), which is displayed in the page title.
  This click counter is independent of the counter's own value — it never
  resets when the counter value resets, and it is not affected by whether the
  counter value went up or down.
- **R-0002 — Unrecognized actions are a no-op.** If the dispatched action code
  doesn't match any known action (i.e. it is unrecognized), then:
  - the counter value is left unchanged,
  - the click counter is **not** incremented, and
  - the display is **not** re-rendered (no DOM update occurs at all).
- **R-0003 — Clicks without a `data-action` do nothing.** Clicks anywhere
  inside the counter widget that don't land on an element carrying a
  `data-action` attribute do nothing at all — no dispatch is attempted, the
  counter value and click counter are both unchanged, and nothing is
  re-rendered.

## 4. Display and color rules

- **R-0004 — Value color thresholds.** The displayed counter value's text
  color depends on its numeric value:
  - **red** when the value is greater than 10 (`value > 10`)
  - **blue** when the value is negative (`value < 0`)
  - **black** for every value from 0 through 10 inclusive (`0 <= value <= 10`)
- **R-0005 — Title reflects the click counter.** The heading above the counter
  always shows the running count of recognized clicks in the exact format:

  ```
  Counter (N clicks)
  ```

  where `N` is the current click counter (`cc`), not the counter value. This
  title is updated every time a recognized action is dispatched and rendered.

## 5. Summary of all rules (for traceability)

- R-0001: Every successfully matched action (increment, decrement, reset,
  add-four, double) increments a separate click counter that is displayed in
  the page title, independent of the counter's own value.
- R-0002: If the dispatched action code doesn't match any known action, the
  counter value is left unchanged, the click counter is not incremented, and
  the display is not re-rendered.
- R-0003: Clicks anywhere inside the counter widget that don't land on an
  element carrying a data-action attribute do nothing at all.
- R-0004: The displayed counter value is colored red when it exceeds 10, blue
  when it's negative, and black for every value from 0 through 10 inclusive.
- R-0005: The heading above the counter always shows the running count of
  recognized clicks in the form "Counter (N clicks)".
- R-0006: Clicking the + button increases the counter value by 1.
- R-0007: Clicking the - button decreases the counter value by 1, with no
  lower bound.
- R-0008: Clicking reset sets the counter back to 0 regardless of its current
  value.
- R-0009: Clicking +4 adds 4 to the counter value in a single step.
- R-0010: Clicking x2 multiplies the current counter value by 2.
