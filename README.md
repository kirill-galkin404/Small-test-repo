# Counter Widget

A small counter widget rendered by `counter.html`. It displays a numeric
value and a click counter, offers five actions that mutate the value, and
supports both an automatic OS-driven dark theme and a manual dark-theme
toggle.

See [RULES.md](RULES.md) for the full, verified statement of the widget's
business rules (the five action formulas, the display color thresholds, the
no-op click cases, and the dispatch/click-count policy). The summary below
is illustrative, not a substitute for RULES.md.

## State

The widget's entire state is exactly two values:

- `c` — the counter's numeric value, initialized to `0`.
- `cc` — a dispatch/click counter, initialized to `0`, displayed in the
  title as "Counter (N clicks)".

There is no third or scratch value; the state shape is `{ c, cc }` and
nothing else.

## Actions

Five buttons each dispatch one action, applying exactly one formula to `c`
(see RULES.md for the authoritative details and edge cases):

- **INCREMENT** (`+`) — `c = c + 1`
- **DECREMENT** (`-`) — `c = c - 1` (no lower bound)
- **RESET** (`reset`) — `c = 0` (does not reset `cc`)
- **ADD_FOUR** (`+4`) — `c = c + 4`
- **DOUBLE** (`x2`) — `c = c * 2`

Every successfully dispatched action also increments `cc` by exactly 1.

The displayed value gets one of three CSS classes based on the new value of
`c`: `value--high` (`c > 10`), `value--negative` (`c < 0`), or
`value--normal` (`0 <= c <= 10`).

## Dark theme

The widget supports two independent dark-theme mechanisms, both implemented
in `style.css`:

- **Automatic**, via the `@media (prefers-color-scheme: dark)` query,
  which follows the operating system's/browser's color-scheme preference
  with no user interaction required.
- **Manual override**, via a sixth button (`#theme-toggle`) rendered by
  `CounterApp`. Clicking it sets `data-theme="dark"` on the document's root
  `<html>` element to force dark mode on, independent of the OS-level
  preference. Clicking it again removes that attribute, which reverts to
  the automatic behavior above — if the OS itself prefers dark, the page
  stays dark, since there is no `data-theme="light"` override; the manual
  toggle can only force dark mode **on**, not force light mode.
  Styling for this override lives in the `[data-theme="dark"]` CSS block in
  `style.css`.

## File layout

- `counter.html` — the entry point. All of its logic is loaded from
  external files; it only loads (in order, via `<script src="...">` tags)
  the React 18.2.0 and
  ReactDOM 18.2.0 UMD builds from a CDN, then `src/counterReducer.js`, then
  `src/CounterApp.js`, and mounts the app into `<div id="root"></div>`.
- `src/counterReducer.js` — a pure `counterReducer(state, actionType)`
  function implementing the five action formulas above (and the
  dispatch/click-count policy) with no DOM access and no side effects.
- `src/CounterApp.js` — the React component tree (`CounterApp`) that owns
  the widget's rendering and event wiring, built entirely with
  `React.createElement` calls — there is no JSX and no bundler; it is
  loaded as a plain classic `<script>` tag.
- `style.css` — all styling, including the value threshold classes and the
  automatic/manual dark-theme blocks described above.
- `RULES.md` — the authoritative, verified statement of the widget's
  business rules.

There is no `counter.js` file anymore; the vanilla-JS implementation it
used to contain has been fully replaced by `src/counterReducer.js` and
`src/CounterApp.js`.

## Tests (dev-only)

`package.json` declares dev-only test tooling (`jest`, `jsdom`, and the
`react`/`react-dom` npm packages used only as test-time stand-ins for the
CDN globals) — it is not a runtime or production dependency, and it does
not introduce a build step for `counter.html`. Two suites exist:

- `test/counterReducer.test.js` — unit tests for the pure
  `src/counterReducer.js` formulas and dispatch/click-count policy.
- `test/counterApp.test.js` — jsdom end-to-end integration tests that
  mount the real `src/CounterApp.js` component tree, simulate button
  clicks, and assert the rendered value/class, click-count title, and
  dark-theme toggle behavior.

Run the tests with:

```
npx jest
```

(equivalently, `npm test`, since `package.json`'s `test` script runs
`jest`).

## Architectural decision: no build step

See
[docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the decision governing how `counter.html` is delivered: no bundler and
no module system, with dependencies (React, ReactDOM, and the two `src`
files) loaded via plain `<script src="...">` tags, either from a CDN or
from this repository. The dev-only `package.json`/`jest` test tooling
described above is an explicit, test-only exception to that decision — it
runs no code in the browser and plays no part in how `counter.html` is
served — not a runtime build step.
