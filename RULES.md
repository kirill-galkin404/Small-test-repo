# Business rules

These rules are derived directly from the counter widget's reducer
(`src/counterReducer.js`) and component (`src/Counter.jsx`).

## Actions

There are exactly five recognized actions, each with an exact numeric
effect on the counter value `c`:

- `INCREMENT` — `c = c + 1`
- `DECREMENT` — `c = c - 1`
- `RESET` — `c = 0`
- `ADD_FOUR` — `c = c + 4`
- `DOUBLE` — `c = c * 2`

## `c` is the sole numeric authority

`c` is the only source of truth for the counter's numeric value. The
rendered display is a read-only view of `c`; nothing else drives or
overrides what is shown.

## Click counter (`cc`) and the title

Every recognized action increments a separate counter, `cc`, exactly once.
`cc` is never shown in the numeric display — it is surfaced only in the
title, formatted as `Counter (N clicks)`, where `N` is the current value of
`cc`.

## Colour threshold

The numeric display's colour is a three-way threshold on `c`:

- `c > 10` → red
- `c < 0` → blue
- otherwise (`0 <= c <= 10`) → black

## Unrecognized actions are rejected silently

An action code that does not match one of the five recognized actions above
is rejected silently: it does not change `c`, does not change `cc`, and
does not trigger a re-render. It is a no-op.
