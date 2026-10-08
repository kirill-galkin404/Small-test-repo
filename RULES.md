# Counter rules

Generated from `src/rules.js` (the single source of truth). `src/rules-doc.test.js` fails if this file drifts from the module.

Actions: `INCREMENT`, `DECREMENT`, `RESET`, `ADD_FOUR`, `DOUBLE`.
Thresholds: `thresholds.high` = 10, `thresholds.low` = 0.

## Rules

### counter-app.unrecognized-action-ignored
- Statement: an action that is not one of the five actions above changes nothing: no state change, no click count, no re-render, no logging.
- Values: only own keys of `ACTIONS` are recognized; inherited keys such as `constructor`, `toString` and `__proto__` are unrecognized. The reducer returns the same state object.
- Treatment: change.

### counter-app.click-count-semantics
- Statement: the click count increments by one for every recognized action, including `RESET` and actions that leave the value unchanged (for example `DOUBLE` on 0). It never decrements and never resets.
- Values: count starts at 0. Title is `Counter (1 click)` for 1 and `Counter (N clicks)` otherwise (including `Counter (0 clicks)`).
- Treatment: change.

### counter-app.increment-decrement
- Statement: `INCREMENT` adds 1 to the value, `DECREMENT` subtracts 1. There is no lower or upper bound.
- Values: `INCREMENT` = +1, `DECREMENT` = -1.
- Treatment: preserve.

### counter-app.reset-to-zero
- Statement: `RESET` sets the value to 0.
- Values: `RESET` = 0.
- Treatment: preserve.

### counter-app.add-four
- Statement: `ADD_FOUR` adds 4 to the value.
- Values: `ADD_FOUR` = +4.
- Treatment: preserve.

### counter-app.double
- Statement: `DOUBLE` multiplies the value by 2.
- Values: `DOUBLE` = x2.
- Treatment: preserve.

### counter-app.value-colour-thresholds
- Statement: the displayed value is red when above `thresholds.high`, blue when below `thresholds.low`, and black otherwise (0 to 10 inclusive).
- Values: `thresholds.high` = 10 (red when value > 10), `thresholds.low` = 0 (blue when value < 0), black from 0 to 10 inclusive. `colorFor` returns `high`, `low` or `normal`; the stylesheet maps these to theme colour tokens.
- Treatment: change.

## Quirk decisions

Status of each: Recommended default, pending operator confirmation (reverting = change rules.js, tests, this file).

1. Title pluralisation: `Counter (1 click)` instead of the legacy `Counter (1 clicks)`.
2. Title from load: rendered as `Counter (0 clicks)` from load instead of the legacy static `Counter` until the first click.
3. Own-key actions only: inherited keys such as `constructor` are ignored; the legacy `ACTION[action]` lookup let them through.
4. Logging dropped: the legacy console logging is removed.
