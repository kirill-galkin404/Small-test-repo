# Legacy `counter.js` behavior contract

This document is a written characterization of the current behavior of
`counter.js` (vanilla JS, no framework, no module system). It exists as
a stable reference for the Angular rewrite and, per the fallback plan,
as an assertable table on its own if `legacy-contract/harness.js` ever
proves not worth maintaining. Every row below is also encoded as a
runnable assertion in `legacy-contract/harness.js` (run with
`node legacy-contract/harness.js`).

## Model

- `c` (number, starts at `0`): the counter value shown in `#d`.
- `cc` (number, starts at `0`): the count of every *successfully
  dispatched* action, shown in the `#ttl` heading as
  `"Counter (N clicks)"`. `cc` is **not** the browser's click count and
  is **not** reset by the RESET action.
- `ACTION`: a frozen map of `data-action` string -> numeric code:
  `INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5`.
- A single `click` listener is bound once to the `#counter` container
  (event delegation), reading `event.target.dataset.action`.

## Dispatch guard (event listener -> `dispatch(x)`)

| # | Input (`event.target.dataset.action`) | Behavior |
|---|---|---|
| G1 | `undefined` / falsy (click didn't land on an element with a `data-action`, e.g. whitespace inside `#counter`) | Listener returns immediately. `dispatch()` is never called. `c` and `cc` unchanged. No render. |
| G2 | A string not present in `ACTION` (e.g. `"BOGUS"`) | `ACTION[action]` is `undefined`, so `dispatch(undefined)` runs, hits the `switch`'s `default` branch, logs a warning via `console.warn`, and returns **before** `cc++` or `render()`. `c` and `cc` unchanged. No render. (= rule R-0008) |
| G3 | One of `INCREMENT`, `DECREMENT`, `RESET`, `ADD_FOUR`, `DOUBLE` | Mapped to its numeric `ACTION` code and dispatched normally (see table below). |

## Action effects on `c` (rules R-0003..R-0007, R-0009)

Every row that reaches this table also increments `cc` by exactly `1`
and calls `render()`. Order and prior state matter only through `c`'s
current value; `cc` always increments unconditionally on a successful
dispatch, independent of what `c` does.

| Action (`data-action`) | Numeric code | Effect on `c` | Effect on `cc` |
|---|---|---|---|
| `INCREMENT` | 1 | `c = c + 1` | `cc = cc + 1` |
| `DECREMENT` | 2 | `c = c - 1` | `cc = cc + 1` |
| `RESET` | 3 | `c = 0` (unconditionally, regardless of prior value) | `cc = cc + 1` (RESET does **not** reset `cc`) |
| `ADD_FOUR` | 4 | `c = c + 4` | `cc = cc + 1` |
| `DOUBLE` | 5 | `c = c * 2` | `cc = cc + 1` |
| *(unmapped / default)* | anything else | unchanged | unchanged |

## `render()` behavior (rules R-0001, R-0002)

Called once, synchronously, at the end of every *successful* dispatch
(never on a no-op/unmapped click).

1. `#d` (`<p id="d">`) `innerHTML` is set to the raw numeric value of
   `c` (e.g. `8`, not `"8"` - the DOM will stringify it).
2. `#d`'s `style.color` is set based on `c`'s value, evaluated in this
   order:
   | Condition | Color |
   |---|---|
   | `c > 10` | `"red"` |
   | `c < 0` (only reached if `c` is not `> 10`) | `"blue"` |
   | otherwise, i.e. `0 <= c <= 10` | `"black"` |

   Note the boundary: `c === 10` is **black**, not red (`c > 10` is
   strict). `c === 0` is black, not blue (`c < 0` is strict).
3. `#ttl` (`<h1 id="ttl">`, **not** `document.title`) `innerHTML` is
   set to the literal string `"Counter (" + cc + " clicks)"`, e.g.
   `"Counter (3 clicks)"`. This always reflects `cc` (successful
   dispatch count), never `c` (the counter value).

## Cross-cutting invariants

- `c` and `cc` are independent: RESET can zero `c` while `cc` keeps
  climbing; an unmapped click changes neither.
- A `render()` call is the *only* way `#d` or `#ttl`'s `innerHTML`/
  `style.color` change; a no-op dispatch (guard G1/G2) never triggers
  `render()`, so the DOM is left exactly as it was after the previous
  successful dispatch (or the initial static HTML, if there hasn't
  been one yet).
- `dispatch()` uses `console.log`/`console.warn` for diagnostics only;
  these are not part of the observable contract for the rewrite (no
  requirement to preserve exact log text), only the `c`/`cc`/DOM
  effects above are.

## Traceability to plan rules

| Plan rule | Where it's covered above |
|---|---|
| R-0001 (red/blue/black thresholds) | `render()` behavior, item 2 |
| R-0002 (`#ttl` heading shows total valid dispatched clicks) | `render()` behavior, item 3 |
| R-0003 (`+` increments `c`) | Action effects table, `INCREMENT` |
| R-0004 (`-` decrements `c`) | Action effects table, `DECREMENT` |
| R-0005 (reset zeroes `c`, not `cc`) | Action effects table, `RESET` |
| R-0006 (`+4` adds 4 to `c`) | Action effects table, `ADD_FOUR` |
| R-0007 (`x2` doubles `c`) | Action effects table, `DOUBLE` |
| R-0008 (unmapped action is a no-op, still logged) | Dispatch guard, rows G1/G2 |
| R-0009 (every successful dispatch bumps `cc`) | Action effects table, "Effect on `cc`" column |

## Corresponding executable assertions

See `legacy-contract/harness.js`, which loads `counter.js` via Node's
`vm` module against a minimal fake DOM and asserts every row above
directly against the real `dispatch()`/`render()` functions. Run with:

```
node legacy-contract/harness.js
```

Exits `0` only if every assertion group passes.
