# Counter Widget — Rules & Contract Specification

This document is the **normative spec** for the counter widget's behaviour, reverse-engineered
and verified against the current vanilla-JS implementation in `counter.js`. It exists so that
later phases of this rewrite (a React reducer + component) can be implemented from a precise,
exhaustive description of behaviour rather than from re-reading the original imperative code.

Any discrepancy between this document and `counter.js` should be treated as a bug in this
document, not in the code — this spec was written by inspecting `counter.js` directly and is
expected to match it exactly.

## 1. State

The widget has exactly two pieces of state:

- `c` — the counter value (starts at `0`).
- `cc` — the click/dispatch count, i.e. the number of actions successfully dispatched so far
  (starts at `0`).

Both `c` and `cc` are **in-memory only**. There is no persistence layer (no `localStorage`, no
cookies, no server round-trip). On a page reload, both `c` and `cc` reset to `0`.

## 2. Actions

Actions are identified by the frozen `ACTION` enum:

```js
const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
```

There are exactly **5 ACTION members**. Each maps to a specific transition of `c` when
dispatched, as implemented in `dispatch(x)`'s `switch` statement:

| Action       | Value | Effect on `c`      |
|--------------|-------|---------------------|
| `INCREMENT`  | 1     | `c = c + 1`          |
| `DECREMENT`  | 2     | `c = c - 1`          |
| `RESET`      | 3     | `c = 0`              |
| `ADD_FOUR`   | 4     | `c = c + 4`          |
| `DOUBLE`     | 5     | `c = c * 2`          |

No other transitions of `c` exist. Every dispatched, recognized action performs exactly one of
the transitions above and then falls through to the shared "success tail" described below — there
is no early return inside any of the five `case` blocks.

## 3. Click-counter tail (`cc`)

After a **successful** dispatch (i.e. `x` matched one of the 5 `ACTION` values above), and only
after the corresponding `c` transition has been applied, the shared tail runs:

1. `cc` is incremented by exactly `1` (`cc++`).
2. `render()` is called.

This holds **regardless of the magnitude of the change to `c`**. For example, `DOUBLE` and
`ADD_FOUR` can change `c` by more than 1 (or leave it unchanged, e.g. doubling `0`), but `cc`
still only ever increments by exactly `1` per dispatched action — `cc` counts *dispatches*, not
magnitude of `c`'s movement.

## 4. Dispatch guard (no-op paths)

There are exactly two distinct paths by which a click can result in **no state change, no `cc`
increment, and no re-render**. Both are no-op guards and must be preserved as distinct guard
conditions in any reimplementation:

1. **Guard path 1 — missing `data-action`.** The click handler on `#counter` reads
   `event.target.dataset.action`. If this is falsy (the clicked element has no `data-action`
   attribute, or it is an empty string), the handler returns immediately and **`dispatch` is
   never called at all**.
2. **Guard path 2 — unmapped/unknown action.** If `dispatch(x)` is called with a value that does
   not match any of the 5 `ACTION` values (e.g. because `event.target.dataset.action` is a string
   that isn't a key of `ACTION`, so `ACTION[action]` evaluates to `undefined`), the `switch`
   falls through to `default`, which logs a warning via `console.warn` and `return`s immediately
   — **before** `cc` is incremented and **before** `render()` is called.

In both guard paths, the outcome is identical from the outside: `c` and `cc` are left completely
unchanged and the DOM is not re-rendered. A correct reimplementation must reject/ignore both
input shapes without mutating state or triggering a render.

## 5. Render rules

`render()` is invoked only as the tail of a successful dispatch (see §3). It performs two
independent updates:

### 5.1 Counter display and color

- The element `#d`'s content is set to the current value of `c`.
- Color of `#d` is derived from `c` with three mutually exclusive, exhaustive bands:
  - `c > 10` → **red**
  - `c < 0` → **blue**
  - otherwise, i.e. `0 <= c <= 10` (0 through 10 **inclusive**) → **black**

### 5.2 Title

- The element `#ttl`'s content is set to the literal string template:
  `"Counter (" + cc + " clicks)"`
- **Known quirk (intentional, do not fix):** the word "clicks" is always plural, even when
  `cc` is `0` or `1`. For example, after exactly one dispatched action the title reads
  `"Counter (1 clicks)"`, not `"Counter (1 click)"`. This grammatical quirk is part of the
  observed, verified behaviour of the current implementation and must be reproduced as-is by
  any reimplementation (e.g. a React component) unless a future step explicitly approves
  changing it. Do not "fix" this pluralization as a side effect of this rewrite.

## 6. Summary for reimplementation

A faithful reducer/component implementation must satisfy all of the following, derived directly
from the above:

- Exactly 5 dispatchable action types, with the exact `c` transitions listed in §2.
- `cc` (click/dispatch counter) increments by exactly 1 per successful dispatch, independent of
  how much `c` changed.
- Both guard paths in §4 must be no-ops: no `c` change, no `cc` change, no re-render/state update.
- Render/derived-display rules in §5.1 (red `c>10`, blue `c<0`, black `0<=c<=10`) and the title
  format in §5.2, including its always-plural "clicks" quirk, must be reproduced exactly.
- `c` and `cc` are transient, in-memory state with no persistence; a fresh mount/reload starts
  both at `0`.
