# Legacy `counter.js` behavior contract

This is a written, human-readable restatement of the assertions encoded in
`legacy-contract/harness.js`. It locks down the **current, observed**
behavior of `counter.js` as the spec for any rewrite (e.g. the Angular
port) — prose in the README/docs is *not* authoritative; this table and the
harness are.

Two module-level state variables:

- `c` — the counter value, starts at `0`.
- `cc` — count of every *recognized* dispatched action ("clicks"), starts at `0`.

## 1. Dispatch guard (R-0008)

| # | Input | Expected effect |
|---|---|---|
| 1 | Click with no `data-action` on the target (`event.target.dataset.action` is falsy) | `dispatch()` is never called. `c` unchanged, `cc` unchanged, `render()` not called (no DOM writes). |
| 2 | Click with a `data-action` that is not a key of `ACTION` (e.g. `"BOGUS"`) | `ACTION[x]` is `undefined` → `dispatch(undefined)` hits the `switch` `default` branch → `console.warn(...)` and early `return`. `c` unchanged, `cc` unchanged, `render()` not called. |

## 2. The five recognized actions (dispatch mutates `c`)

| # | Action | Rule | Effect on `c` | Effect on `cc` |
|---|---|---|---|---|
| R-0003 | `INCREMENT` (`ACTION.INCREMENT = 1`) | `+` button increases value by 1 | `c = c + 1` | `cc = cc + 1` |
| R-0004 | `DECREMENT` (`ACTION.DECREMENT = 2`) | `-` button decreases value by 1 | `c = c - 1` | `cc = cc + 1` |
| R-0005 | `RESET` (`ACTION.RESET = 3`) | reset sets value to 0, does **not** reset click counter | `c = 0` | `cc = cc + 1` (NOT reset) |
| R-0006 | `ADD_FOUR` (`ACTION.ADD_FOUR = 4`) | `+4` button increases value by 4 | `c = c + 4` | `cc = cc + 1` |
| R-0007 | `DOUBLE` (`ACTION.DOUBLE = 5`) | `x2` button doubles the value | `c = c * 2` | `cc = cc + 1` |

## 3. Click counting (R-0009)

Every successfully dispatched (i.e. recognized) action increments `cc` by
exactly 1, regardless of which action it was — including `RESET`. An
unmapped/missing action never increments `cc`, even when interleaved
between recognized actions.

## 4. Render: display color thresholds (R-0001)

After every recognized dispatch, `render()` runs and sets `#d`'s
`style.color` based on the **current** value of `c`:

| Condition on `c` | Color |
|---|---|
| `c > 10` | `red` |
| `c < 0` | `blue` |
| otherwise (`0 <= c <= 10`, inclusive of both boundaries) | `black` |

Boundary cases verified explicitly: `c == 10` → `black` (not `> 10`);
`c == 11` → `red`; `c == -1` → `blue`; `c == 0` → `black`.

`#d`'s `innerHTML` is always set to the raw value of `c` (no formatting).

## 5. Render: title format (R-0002)

`#ttl`'s `innerHTML` is set to the literal string:

```
Counter (N clicks)
```

where `N` is the current value of `cc` (the count of recognized
dispatches so far, not the value of `c`). E.g. after one recognized
dispatch: `"Counter (1 clicks)"`. Grammar ("1 clicks" rather than "1
click") is preserved exactly as legacy behavior — no pluralization
handling exists in `counter.js`.

## 6. Non-goals / explicitly out of scope for this contract

- No `module.exports` exists in `counter.js`; it is a browser script that
  wires itself up on load via `document.getElementById("counter")`. The
  harness loads it through Node's `vm` module with a minimal `document`
  stub rather than importing it.
- `console.log`/`console.warn` calls inside `dispatch()` are incidental
  logging, not part of the contract.

## Verification

`legacy-contract/harness.js` runs all of the above as executable
assertions against the real `counter.js` source (loaded via `vm`, with a
fake DOM), and exits `0` only if every assertion passes:

```
node legacy-contract/harness.js
```

44 assertions, 0 failures as of this writing.
