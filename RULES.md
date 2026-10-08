# Counter rules

The behaviour of the counter lives in the pure module `src/counterRules.js`
(no DOM or React APIs). State shape: `{ c: number, cc: number }` where `c` is the
displayed value and `cc` is the click count; `initialState = { c: 0, cc: 0 }`.
Actions are objects `{ type: '<NAME>' }` with `type` one of `ACTION_TYPES`
(`INCREMENT`, `DECREMENT`, `RESET`, `ADD_FOUR`, `DOUBLE`). `counterReducer(state, action)`
is pure; `Counter.jsx` drives it with `useReducer`.

## Arithmetic

### counter-app.increment-decrement (R-0003)
`INCREMENT` adds 1 to `c`; `DECREMENT` subtracts 1. Unbounded in both directions.
Edge cases: `c` may go negative or grow without limit; nothing clamps it.

### counter-app.reset-to-zero (R-0004)
`RESET` sets `c` to 0.
Edge cases: reset from 0 is still a recognised action, so the click count still increments.

### counter-app.add-four (R-0005)
`ADD_FOUR` adds 4 to `c`.
Edge cases: works from negative values (-10 gives -6); unbounded.

### counter-app.double (R-0006)
`DOUBLE` multiplies `c` by 2.
Edge cases: doubling 0 stays 0; doubling a negative value gives a more negative value (-3 gives -6); unbounded.

## Dispatch and click count

### counter-app.unrecognized-action-ignored (R-0001) — changed
An action whose type is not in the action table changes nothing: no state change,
no click count increment and no re-render (the reducer returns the identical state object).
The former console warning was dropped (marked changed).
Edge cases: inherited names such as `constructor`, `__proto__` and `toString`, a missing
action, or a non-object action are all unrecognised; only own-property matching is used.

### counter-app.click-count-semantics (R-0002)
`cc` increments by one for every recognised action, including `RESET`, and never
decrements or resets. The heading shows `Counter` while `cc` is 0, then `Counter (N clicks)`.
Edge cases: `1 clicks` (no singular form) is kept; the initial title is the bare `Counter` until the first action.

## Display thresholds

### counter-app.value-colour-thresholds (R-0007) — changed
The value is shown in a red-family tone above 10, a blue-family tone below 0, and a
neutral tone otherwise (`valueTone` returns `high`, `low`, `neutral`).
Changed: neutral was black; it is now a light tone suited to the dark theme.
Colours (from `src/counter.css`):
- `--tone-high`: `#ff6b6b` (stays red-family)
- `--tone-low`: `#6cb6ff` (stays blue-family, lightened for contrast against the dark background)
- `--tone-neutral`: `#e6edf3` (was black)

Edge cases: exactly 10 and exactly 0 are neutral; -1 is low; 11 is high.

## Decision log

- Rules live in `src/counterRules.js`; `Counter.jsx` uses `useReducer` (D-0002) — kept behaviour, new structure.
- The `cc` / "clicks" wording — kept.
- `1 clicks` pluralisation — kept.
- Bare initial title `Counter` until the first action — kept.
- Unbounded arithmetic — kept.
- Console logging (including the unknown-action warning) — dropped, changed (D-0003).
