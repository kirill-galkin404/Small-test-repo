# counter.js behavioral checklist

This checklist enumerates the full observable contract of `counter.js`
(pre-TypeScript-port, commit `b0431b8`) so that the `counter.ts` port
(and every future regeneration of `counter.js` from it) can be checked
against it. It is documentation only — no test runner or `package.json`
is introduced, per ADR-0001.

## ACTION map

- `ACTION.INCREMENT` = `1`
- `ACTION.DECREMENT` = `2`
- `ACTION.RESET` = `3`
- `ACTION.ADD_FOUR` = `4`
- `ACTION.DOUBLE` = `5`
- The map is frozen (`Object.freeze`).

## dispatch(x) state mutations

- `ACTION.INCREMENT` → `c = c + 1`
- `ACTION.DECREMENT` → `c = c - 1`
- `ACTION.RESET` → `c = 0`
- `ACTION.ADD_FOUR` → `c = c + 4`
- `ACTION.DOUBLE` → `c = c * 2`

## Shared tail (matched actions only)

- Every one of the 5 cases above falls through to a shared tail that:
  - increments `cc` (`cc++`)
  - calls `render()`

## Unrecognized-action path

- If `x` does not match any `ACTION` case, `dispatch` logs
  `console.warn("dispatch: unrecognized action", x)` and returns early.
- `cc` is **not** incremented and `render()` is **not** called.

## No-data-action silent exit

- The click handler reads `event.target.dataset.action`. If it is falsy
  (the click did not land on a button with a `data-action` attribute),
  the handler returns immediately without calling `dispatch` at all.

## render() DOM effects

- `#d` element's text content (`innerHTML`) is set to `c`.
- `#d` element's `style.color` is set to:
  - `"red"` if `c > 10`
  - `"blue"` if `c < 0`
  - `"black"` otherwise
- `#ttl` element's text content (`innerHTML`) is set to
  `"Counter (" + cc + " clicks)"`.
