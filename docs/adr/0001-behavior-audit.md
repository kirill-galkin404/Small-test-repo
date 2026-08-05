# Behavior audit: counter widget (companion to ADR 0001)

## Status

Informational — records a point-in-time, read-only verification of
`counter.html` / `counter.js` / `style.css` / `index.html`. This is not a
decision record; it does not amend or supersede
[0001-single-file-vs-build-step.md](0001-single-file-vs-build-step.md). It
exists because that ADR fixed the project against introducing a build step
or test framework (Fork A), so there is no automated test suite that can
assert these behaviors — this document is the non-test-suite durability
mechanism for that verified state, re-closing the exact class of
data-action/label drift a prior manual review (PR #31) caught by hand.

Verified against commit `b0431b87fdffe38a63329d6bb80ebb0577cbeea9` plus the
CSS fix landed alongside this document (ADD_FOUR/DOUBLE button styling,
Phase 1 of the same change).

## 1. Action cross-reference matrix

For every button in `counter.html`, the `data-action` attribute is looked up
in the frozen `ACTION` enum (`counter.js` line 1) by the delegated click
handler (`counter.js` lines 5–11), which calls `dispatch(ACTION[action])`.
`dispatch`'s `switch` (`counter.js` lines 13–44) matches on the numeric
`ACTION` value.

| Action | data-action | ACTION value | switch effect (counter.js) | Button label | Label matches effect | Expected render() color for a lone click from c=0 |
|---|---|---|---|---|---|---|
| Increment | `INCREMENT` | 1 | `c = c + 1` (line 18) | `+` | match | black (c=1, within 0–10) |
| Decrement | `DECREMENT` | 2 | `c = c - 1` (line 22) | `-` | match | blue (c=-1, c<0) |
| Reset | `RESET` | 3 | `c = 0` (line 26) | `reset` | match | black (c=0, within 0–10) |
| Add four | `ADD_FOUR` | 4 | `c = c + 4` (line 30) | `+4` | match | black (c=4, within 0–10) |
| Double | `DOUBLE` | 5 | `c = c * 2` (line 34) | `x2` | match | black (c=0, within 0–10; doubling only changes magnitude relative to prior `c`) |

No unresolved discrepancy: all 5 actions are internally consistent across
`data-action`, the `ACTION` enum, the `dispatch` switch arithmetic, and the
visible label. (This is the same class of check that previously caught the
ADD_FOUR button mislabeled "+5" — see `git log` on `ff9bac3`, "Release · PR
#30 (#31)" — and it is currently clean.)

Styling: as of this change, `style.css` has one `button[data-action="..."]`
rule per action (`INCREMENT` green, `DECREMENT` red, `RESET` gray,
`ADD_FOUR` purple, `DOUBLE` orange), each with `padding: 10px` and
`color: white`, so all 5 buttons render as one uniform styled set instead of
the last two falling back to default browser button chrome.

## 2. render() color thresholds and title source

`render()` (`counter.js` lines 46–58) sets `#d`'s text color with:

```js
if (c > 10) { color = "red" }
else if (c < 0) { color = "blue" }
else { color = "black" }
```

Boundary reasoning:

- `c = 0`: fails `c > 10`, fails `c < 0` → **black**. Correct (0 is inside the documented 0–10-inclusive "normal" band).
- `c = 10`: fails `c > 10` (strict `>`, 10 is not greater than 10), fails `c < 0` → **black**. Correct — 10 is the inclusive upper edge of the black band, not red.
- `c = 11`: passes `c > 10` → **red**. Correct — first value above the black band.
- `c = -1`: fails `c > 10`; passes `c < 0` → **blue**. Correct — first value below the black band.

No inversion (red/blue are not swapped relative to their conditions) and no
off-by-one (the `>`/`<` are strict, and both edges of the 0–10 inclusive
"black" band land on the correct color in the checks above).

Title source: line 57, `document.getElementById("ttl").innerHTML = "Counter
(" + cc + " clicks)"`, reads `cc` — the dispatch/click counter incremented
once per successfully dispatched action (line 41) — not `c`, the numeric
value being displayed. Confirmed: the title tracks click count, the `#d`
paragraph tracks the counter value; these are two different variables by
design, and the code reads the correct one for each.

## 3. Unrecognized-action (default) branch

`dispatch`'s `default` case (`counter.js` lines 36–38):

```js
default:
  console.warn("dispatch: unrecognized action", x)
  return;
```

The `return` on line 38 exits `dispatch` immediately, before reaching the
shared tail on lines 41–43 (`cc++`, the "cc incremented" log, and
`render()`). Confirmed no fallthrough: for any `x` not matching one of the
five `case` values (e.g. `ACTION[someUnknownDataAction]` evaluating to
`undefined`, or any other non-mapped numeric value), `c` and `cc` are left
unmodified and `render()` is not invoked — the DOM is not touched and no
re-render occurs for an unrecognized action.

## 4. index.html entry-point redirect

`index.html` contains `<meta http-equiv="refresh" content="0; url=counter.html">`
and a fallback link to the same target, `counter.html`. `counter.html`
exists at the repository root alongside `index.html` and is the working
counter UI described in section 1 above (5 buttons wired via
`data-action`/`ACTION`/`dispatch`, `style.css` linked, `counter.js` loaded
as a classic script). Confirmed: the redirect target exists and is the
working UI, whether `counter.html` is opened directly or reached via the
`index.html` redirect.

## Scope note

This audit is read-only with respect to `counter.js`, `counter.html`, and
`index.html` — the only code change made alongside this document is the
`style.css` addition described in section 1. Per ADR 0001, no
`package.json`, bundler, module system, or test framework was introduced to
produce or check this audit.
