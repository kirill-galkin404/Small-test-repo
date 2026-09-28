# Business Rules

This document is derived exclusively from `counter.js` (the actual
implementation), not from README.md prose — README.md is known to
contain inaccuracies that are corrected separately.

## ACTION keys (frozen map — completeness checklist)

`ACTION` is `Object.freeze`-d and defines exactly these five keys. Every
rule below maps to one of them:

- [x] `INCREMENT`
- [x] `DECREMENT`
- [x] `RESET`
- [x] `ADD_FOUR`
- [x] `DOUBLE`

## The 9 business rules

1. **R-0001 — Increment**: dispatching `ACTION.INCREMENT` sets
   `c = c + 1`.
2. **R-0002 — Decrement**: dispatching `ACTION.DECREMENT` sets
   `c = c - 1`.
3. **R-0003 — Add Four**: dispatching `ACTION.ADD_FOUR` sets
   `c = c + 4`.
4. **R-0004 — Double**: dispatching `ACTION.DOUBLE` sets `c = c * 2`.
5. **R-0005 — Reset clears `c` but never clears `cc`**: dispatching
   `ACTION.RESET` sets `c = 0`. Clicking reset does **NOT** reset `cc`
   (the click counter shown in the title) — `cc` only ever increases.
   This is a common point of confusion: "reset" resets the displayed
   count, not the click history.
6. **R-0006 — `cc` increments on every valid dispatched action,
   including RESET**: after any recognized `switch` case in
   `dispatch()` runs to completion — INCREMENT, DECREMENT, RESET,
   ADD_FOUR, or DOUBLE alike — `cc` is incremented by 1 and `render()`
   is called. RESET is a valid dispatched action just like the others,
   so it increments `cc` exactly like every other action.
7. **R-0007 — Dispatch guard ignores unrecognized/missing actions**:
   if the clicked element has no `data-action` attribute, the click
   handler returns immediately without calling `dispatch()`. If
   `dispatch(x)` is called with a value that matches none of the five
   `ACTION` cases, the `default` branch logs a warning
   (`"dispatch: unrecognized action"`) and returns before incrementing
   `cc` or calling `render()`. In both cases `c` and `cc` are left
   completely unchanged and nothing is re-rendered — the click is
   effectively ignored.
8. **R-0008 — Color thresholds**: on every successful render, the `#d`
   element's text color is set from the current value of `c`:
   - `red` when `c > 10`
   - `blue` when `c < 0`
   - `black` otherwise (i.e. `0 <= c <= 10`)
9. **R-0009 — Title click-count text**: on every successful render, the
   `#ttl` element's text is set to `"Counter (" + cc + " clicks)"`,
   reflecting the total number of valid dispatched actions (`cc`), not
   the counter value (`c`).

## Quick reference: ACTION → effect on `c`

| ACTION key  | Effect on `c` | Increments `cc`? |
|-------------|----------------|-------------------|
| `INCREMENT` | `c = c + 1`    | yes |
| `DECREMENT` | `c = c - 1`    | yes |
| `RESET`     | `c = 0`        | yes (does not reset `cc` itself) |
| `ADD_FOUR`  | `c = c + 4`    | yes |
| `DOUBLE`    | `c = c * 2`    | yes |
| *(anything unrecognized)* | unchanged | no — ignored |

## Theme toggle

The `#theme-toggle` button is presentation-only. Its click handler is a
separate `addEventListener` registered directly on `#theme-toggle` — it is
**not** part of the delegated `#counter` click handler, has no
`data-action` attribute, and is wired up independently in `counter.js`.
Clicking it flips the `data-theme` attribute on `<html>` and persists the
choice to `localStorage`. The theme toggle does not dispatch an ACTION and
does not change `c` or `cc` — it never calls `dispatch()`, is not one of
the five `ACTION` keys, and has no effect on any business rule above.
