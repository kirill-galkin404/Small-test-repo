# Counter Widget — Business Rules

This document is the canonical, human-readable specification for the counter
widget's behavior, mirrored by the automated test suite
(`src/counterReducer.test.js`, `src/Counter.test.jsx`).

## Actions

Five actions are recognized by the reducer, each mutating `c` as follows:

| Action    | Effect on `c` |
|-----------|---------------|
| INCREMENT | `c = c + 1`   |
| DECREMENT | `c = c - 1`   |
| RESET     | `c = 0`       |
| ADD_FOUR  | `c = c + 4`   |
| DOUBLE    | `c = c * 2`   |

Every recognized action above also increments `cc`, a click counter, by 1.

## State authority

`c` is the sole numeric authority for the counter's value. `cc` is surfaced
only in the page/component title (e.g. `"Counter (N clicks)"`) — it never
appears in the numeric display itself. The rendered display and DOM never
feed state back into `c` or `cc`; all mutation flows one-way through the
reducer.

## No-op contract

An unrecognized action type is rejected silently: it must not affect `c` or
`cc`, must not trigger a re-render, and the reducer must return the exact
same state object reference it was given (not a new object with equal
values).

## Colour thresholds

The displayed counter value is coloured based on a three-way threshold on
`c`:

- **red** when `c > 10`
- **blue** when `c < 0`
- **black** otherwise (i.e. `0 <= c <= 10`)
