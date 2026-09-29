# Legacy `counter.js` behavior contract

## Why this file is a table, not an executable harness

This is the **I-0002 fallback** authorized by the Plan: *"If a JSDOM/vm
harness proves more costly than the widget warrants, fall back to a written
contract table and have phase-6 specs assert against that table instead."*

`counter.js` (and `index.html`/`counter.html`) were permanently deleted from
this repository by step S-0011 (retiring the legacy global-script widget).
`legacy-contract/harness.js` — a previous, now-superseded attempt at this
step's deliverable, which would have loaded `counter.js` into a JSDOM/`vm`
sandbox to characterize it executably — was itself deleted by step S-0008
for the same reason: an executable harness cannot load a source file that no
longer exists in the tree, and it must not be restored.

**This table is therefore the canonical, authoritative reference for
behavior assertions in the `CounterService`/`CounterComponent` specs
(phase-6 / sibling lanes).** It restates the exact original behavior of
`counter.js` as verified against the Plan's base commit
(`b0431b87fdffe38a63329d6bb80ebb0577cbeea9`, path `counter.js`), one row per
rule, in a format meant to translate directly into unit-test assertions.

## State model

Original code kept two independent pieces of module-level state:

| Symbol | Meaning | Initial value |
|---|---|---|
| `c` | the **counter value** | `0` |
| `cc` | the **click counter** — counts every *recognized/successfully-dispatched* action, shown in the heading as "clicks" | `0` |

## Action codes (original `ACTION` enum)

```js
const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
```

## Assertion table

One row = one directly-testable rule. `c`/`cc` columns show the *only*
state that rule is allowed to touch; `render?` says whether a
display/heading update is expected to follow.

| # | Rule ID(s) | Action / scenario | Initial state example | Expected resulting state | click counter (`cc`) behavior | render? |
|---|---|---|---|---|---|---|
| 1 | R-0003, R-0009 | Dispatch `INCREMENT` (`+` button) | `c = 0, cc = 0` | `c = 1` | `cc += 1` → `cc = 1` | yes |
| 2 | R-0004, R-0009 | Dispatch `DECREMENT` (`-` button) | `c = 0, cc = 0` | `c = -1` | `cc += 1` → `cc = 1` | yes |
| 3 | R-0005, R-0009 | Dispatch `RESET` (`reset` button) | `c = 7, cc = 3` | `c = 0` (**not** `cc`) | `cc += 1` → `cc = 4` | yes |
| 4 | R-0006, R-0009 | Dispatch `ADD_FOUR` (`+4` button) | `c = 2, cc = 0` | `c = 6` | `cc += 1` → `cc = 1` | yes |
| 5 | R-0007, R-0009 | Dispatch `DOUBLE` (`x2` button) | `c = 3, cc = 0` | `c = 6` | `cc += 1` → `cc = 1` | yes |
| 6 | R-0007 (edge case) | Dispatch `DOUBLE` when `c = 0` | `c = 0, cc = 0` | `c = 0` (`0 * 2 = 0`) | `cc += 1` → `cc = 1` | yes |
| 7 | R-0008 | Dispatch with an unmapped/unrecognized action code (e.g. click target has `data-action="BOGUS"`, so `ACTION[action]` is `undefined` and the `switch` falls to `default`) | `c = 5, cc = 2` | `c = 5` (**unchanged**) | `cc` **unchanged** (stays `2`) | **no** — only `console.warn("dispatch: unrecognized action", x)` is emitted |
| 8 | R-0008 (edge case) | Click target has **no** `data-action` attribute at all (`event.target.dataset.action` is falsy) | `c = 5, cc = 2` | `c = 5` (**unchanged**) | `cc` **unchanged** (stays `2`) | **no** — original code returns immediately before calling `dispatch()` at all; not even a `console.warn` is emitted in this specific sub-case (distinct from row 7, which does warn) |
| 9 | R-0001 | Display color when `c > 10` (e.g. `c = 11`) | `c = 11` | color = **red** | n/a | — |
| 10 | R-0001 | Display color when `c < 0` (e.g. `c = -1`) | `c = -1` | color = **blue** | n/a | — |
| 11 | R-0001 | Display color boundary: `c = 10` | `c = 10` | color = **black** (`10` is *not* `> 10`) | n/a | — |
| 12 | R-0001 | Display color boundary: `c = 0` | `c = 0` | color = **black** | n/a | — |
| 13 | R-0001 | Display color, general "otherwise" case (e.g. `c = 5`) | `c = 5` | color = **black** | n/a | — |
| 14 | R-0002 | Heading text format after any recognized dispatch | `cc = 0` before, dispatch one recognized action | heading text (the `<h1 id="ttl">` element's content — **not** `document.title`) = `"Counter (1 clicks)"` | — | — |
| 15 | R-0002 | Heading text uses the literal, un-pluralized template `"Counter (" + cc + " clicks)"` for every `cc`, including `cc = 1` (i.e. `"Counter (1 clicks)"`, not `"Counter (1 click)"` — no singular/plural grammar handling exists in the original) | `cc = 1` | heading text = `"Counter (1 clicks)"` | — | — |
| 16 | R-0009 | Interleaving: a run of `INCREMENT, BOGUS, INCREMENT` | `c = 0, cc = 0` | `c = 2` after both increments | `cc = 2` (the `BOGUS` dispatch in between contributes nothing to `cc`, confirming rows 7/16 don't leak into recognized-action counting) | yes (twice, once per recognized dispatch; not for `BOGUS`) |

## Non-goals (explicitly out of contract scope)

- Internal `console.log`/`console.warn` call sites and their exact message
  strings are incidental implementation detail, not contractual — only the
  *presence/absence* of a state change and re-render (rows 7/8 above) is
  contractual.
- The exact DOM wiring mechanism (legacy: `addEventListener` on
  `#counter`, reading `event.target.dataset.action`) is an implementation
  detail; only the externally observable state-transition behavior above is
  contractual for the Angular rewrite.

## Rule ID cross-reference

| Rule ID | Statement |
|---|---|
| R-0001 | The displayed counter digit is colored red when the value exceeds 10, blue when negative, black otherwise. |
| R-0002 | The page heading always shows the total number of valid dispatched clicks (format: `"Counter (N clicks)"`). This is the on-page `<h1 id="ttl">` heading text, NOT the browser tab's `document.title`. |
| R-0003 | Clicking `+` increases the counter value by 1. |
| R-0004 | Clicking `-` decreases the counter value by 1. |
| R-0005 | Clicking `reset` sets the counter value to zero, but does NOT reset the click counter. |
| R-0006 | Clicking `+4` increases the counter value by 4. |
| R-0007 | Clicking `x2` doubles the current counter value. |
| R-0008 | A click that doesn't map to a known action code is logged (when a `data-action` is present but unrecognized) or silently returns (when `data-action` is absent) and otherwise ignored: no value change, no click-counter increment, no re-render. |
| R-0009 | Every successfully dispatched action increments the separate click counter shown in the heading. |
