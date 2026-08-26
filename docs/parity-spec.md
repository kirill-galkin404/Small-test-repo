# Counter widget — parity spec

This document is the acceptance criteria for the React port of the counter
widget (see [ADR 0002](adr/0002-react-build-step.md)). It enumerates the
exact observable behavior of the original `counter.html`/`counter.js`
implementation that the ported `src/reducer.js` + `src/Counter.jsx`
implementation must reproduce with no observable difference.

## Action transitions

State is the pair `{c, cc}`: `c` is the counter value, `cc` counts every
*dispatched* action (i.e. every click that matches a known action) and is
shown as "clicks" in the title.

| Action     | Before        | After                        |
|------------|---------------|-------------------------------|
| INCREMENT  | `c`, `cc`     | `c: c + 1`, `cc: cc + 1`       |
| DECREMENT  | `c`, `cc`     | `c: c - 1`, `cc: cc + 1`       |
| RESET      | `c`, `cc`     | `c: 0`, `cc: cc + 1`           |
| ADD_FOUR   | `c`, `cc`     | `c: c + 4`, `cc: cc + 1`       |
| DOUBLE     | `c`, `cc`     | `c: c * 2`, `cc: cc + 1`       |

Every matched action above increments `cc` by exactly 1 (in addition to its
`c` transition) and triggers a render/re-render of the UI.

## Unmatched-action rule

An action that does not match any of the five actions above is a no-op:

- `console.warn` is called noting the unrecognized action.
- The function returns early.
- Neither `c` nor `cc` changes.
- No render happens (in the React port: no state update, so no re-render).

## Colour bands

`#d` (the counter value display) colour is derived from `c`:

| Condition   | Colour  |
|-------------|---------|
| `c > 10`    | red     |
| `c < 0`     | blue    |
| otherwise (`0 <= c <= 10`) | black |

Boundary notes: `c = 10` and `c = 0` are both "otherwise" (black); `c = 11`
is the first red value; `c = -1` is the first blue value.

## Title string format

`#ttl`'s text depends on whether any action has ever been dispatched yet:

- Before the first dispatched action (`cc = 0`, i.e. the initial/untouched
  state), `#ttl`'s text is the bare string `Counter` — the original
  `counter.js` only ever updates `#ttl` from inside `render()`, which is
  itself only called from `dispatch()`, so it is never invoked on page
  load; the static markup `Counter` is what the page shows until the first
  click.
- From the first dispatched action onward (`cc >= 1`), `#ttl`'s text is
  exactly:

  ```
  Counter (N clicks)
  ```

  where `N` is the current value of `cc` (e.g. `cc = 1` →
  `Counter (1 clicks)`).

## Recorded decisions

### D-0003 — index.html becomes the real Vite entry document

The original `index.html` was a static meta-refresh redirect to
`counter.html`. Since Vite requires a real build entry document, this port
replaces `index.html` with the actual Vite entry point: it loads
`src/main.jsx`, which mounts `<Counter />`. This resolves the previously
open "index.html redirect vs. real entry" question in favor of a real entry
document — there is no longer a `counter.html` to redirect to, since it is
removed as part of this port (see S-0005).

### D-0004 — ADD_FOUR/DOUBLE styling decision

The original `style.css` only defines `padding`/`background`/`color` rules
for the `INCREMENT`, `DECREMENT`, and `RESET` buttons; `ADD_FOUR` and
`DOUBLE` render with plain browser-default button chrome (R-0005, the
pre-port behavior). This port changes that: the ported `style.css` adds
`button[data-action="ADD_FOUR"]` and `button[data-action="DOUBLE"]`
selectors so all five buttons share a consistent padding/background/color
treatment, rather than preserving the original inconsistency.

## Manual acceptance

Each item below must be checked off against the built app
(`npm run build` + serving the built output, or `npm run dev`) before the PR
is considered complete.

- [x] INCREMENT (`+`) increases the displayed value by 1 and increments the
      click count in the title.
- [x] DECREMENT (`-`) decreases the displayed value by 1 and increments the
      click count in the title.
- [x] RESET sets the displayed value to 0 and increments the click count in
      the title.
- [x] ADD_FOUR (`+4`) increases the displayed value by 4 and increments the
      click count in the title.
- [x] DOUBLE (`x2`) doubles the displayed value and increments the click
      count in the title.
- [x] The value display (`#d`) turns red once the value exceeds 10.
- [x] The value display (`#d`) turns blue once the value goes below 0.
- [x] The value display (`#d`) is black for values from 0 to 10 inclusive.
- [x] The title reads the bare `Counter` before any button has been
      clicked, then exactly `Counter (N clicks)` with the correct click
      count from the first click onward.
- [x] All five buttons (`+`, `-`, `reset`, `+4`, `x2`) render with the same
      padding/background/color visual treatment (D-0004).
- [x] The built app loads from `index.html` via Vite with no console errors
      and no references to `counter.html`/`counter.js`.
