# Counter Widget — Business Rules Contract

This document is the authoritative behaviour contract for the counter widget.
It describes the **current, vanilla-JS implementation** (`counter.js`) exactly
as it behaves today. Any rewrite (e.g. the React + Vite port) MUST reproduce
this behaviour precisely — these rules are the acceptance criteria the new
implementation is checked against.

There are two independent pieces of state:

- **counter value** (`c` in the current code) — the number shown to the user
  and mutated by the button actions.
- **click count** (`cc` in the current code) — a running total of every
  *recognized* action dispatched, shown in the page title. It is distinct
  from the counter value.

## Actions and mutation formulas

Each button dispatches one of five known action codes. Given the current
counter value `c`, the mutation formulas are:

| Rule ID | Button | Action code | Mutation formula |
|---------|--------|--------------|-------------------|
| R-0001 | `+`     | `INCREMENT` | `c = c + 1` |
| R-0002 | `-`     | `DECREMENT` | `c = c - 1` (no minimum floor — the value can go negative) |
| R-0003 | `reset` | `RESET`     | `c = 0` (unconditionally, regardless of the current value) |
| R-0004 | `+4`    | `ADD_FOUR`  | `c = c + 4` (applied in a single click) |
| R-0005 | `x2`    | `DOUBLE`    | `c = c * 2` (doubles the current value) |

These are the only five recognized actions: `INCREMENT`, `DECREMENT`,
`RESET`, `ADD_FOUR`, `DOUBLE`.

## R-0006: Unrecognized action path

If the dispatch mechanism is invoked with an action code that does not match
any of the five known actions above:

- The counter value is **not** changed.
- The click count is **not** incremented.
- The display is **not** re-rendered.
- The only observable effect is a diagnostic warning (`console.warn`) noting
  the unrecognized action.

In other words, an unrecognized action is a complete no-op with respect to
state and rendering — it only logs a warning and returns early.

## R-0007: Click count / title rule

Every time a *recognized* action (one of the five above) is successfully
dispatched, a separate "clicks" counter is incremented by 1, regardless of
which of the five actions was dispatched and regardless of what the
resulting counter value is.

This click count is displayed in the page title using the exact format:

```
Counter (<n> clicks)
```

where `<n>` is the current click count. This title/click-count value is
independent of the counter's numeric value — e.g. clicking `reset` still
increments the click count even though the counter value becomes `0`.

The click count is **not** incremented by unrecognized actions (see
R-0006).

## R-0008: Display color thresholds

After every successful (recognized) action, the displayed counter value's
color is determined by comparing the current counter value `c` against two
thresholds, evaluated in this order:

1. **Red**: if `c > 10` (the value strictly exceeds 10) → display color is
   **red**.
2. **Blue**: otherwise, if `c < 0` (the value is negative) → display color
   is **blue**.
3. **Black (default)**: otherwise — i.e. whenever `0 <= c <= 10` — display
   color is **black**. This is the default/else case and applies to the
   initial value (`c = 0`) as well as any value in the inclusive range
   `[0, 10]`.

These thresholds are re-evaluated on every render, so the color always
reflects the current counter value.
