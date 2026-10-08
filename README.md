# Counter

A small counter widget built with Vite and React 18. It has five buttons, a
click count shown in the heading, and a light/dark theme.

## Setup

- Node.js 18 or newer (tested on Node 22) and npm.
- Install dependencies:

```sh
npm install
```

## Scripts

| Command           | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Starts the Vite dev server with hot reload.                     |
| `npm run build`   | Produces the production build in `dist/` (relative base `./`).  |
| `npm run preview` | Serves the built `dist/` locally over http.                     |
| `npm test`        | Runs the whole Vitest suite once (`vitest run`).                |

The app can no longer be opened directly from disk via `file://`. Use
`npm run dev` during development, or serve the built `dist/` over http (for
example with `npm run preview`). Because the build uses the relative base
`./`, `dist/` can be hosted from a subpath.

## Project structure

```
index.html                 Vite entry page with <div id="root"> and the module script
package.json               Scripts and dependencies
package-lock.json          Locked dependency versions
vite.config.js             Vite, React plugin and Vitest (jsdom) configuration
docs/adr/                  Architecture decision records
src/
  main.jsx                 Mounts <App /> in StrictMode, imports the stylesheets
  App.jsx                  Lays out the theme toggle and the counter
  Counter.jsx              Counter UI: heading, value, five buttons, document.title sync
  counterReducer.js        Pure reducer, initial state and valueTone()
  ThemeToggle.jsx          Button that switches between light and dark
  useTheme.js              Theme state hook: storage, OS preference, data-theme
  theme.css                Light and dark palettes as CSS variables
  counter.css              Layout and component styles using the theme variables
  setupTests.js            Loads the jest-dom matchers for Vitest
  counterReducer.test.js   Reducer and valueTone unit tests
  Counter.test.jsx         Counter component tests
  theme.test.jsx           Theme toggle and persistence tests
  theme.contrast.test.js   Palette consistency and contrast tests
```

## Behaviour contract

The counter holds a value (starting at 0) and a click count (starting at 0).

Rules carried over from the original widget:

- `+` adds 1, `-` subtracts 1, `reset` sets the value to 0, `+4` adds 4 and
  `x2` doubles the value.
- There are no bounds: the value can go negative or grow without limit.
- The click count goes up by one on every recognised action, including
  `reset`. It never decrements and is never reset.
- The value is shown in red when it is above 10, in blue when it is below 0,
  and in the default colour otherwise (0 to 10 inclusive).
- The value and the count live in memory only. Reloading the page resets both
  to 0.

Intentional changes from the original widget (see
[ADR 0002](docs/adr/0002-react-vite-architecture.md)):

- The reducer accepts an action only if its type is an own property of the
  handler table, so inherited keys such as `constructor` or `toString` are
  ignored.
- The value is rendered as text by React, not as HTML.
- The heading reads `Counter (N clicks)` from the first render, with the
  singular `Counter (1 click)` for exactly one click. The same text is
  mirrored into `document.title`.
- Nothing is exposed as a global, and nothing is written to the console, not
  even warnings.
- There is no `index.html` redirect to `counter.html`; `index.html` is the
  Vite entry page.
- The default colour of the value follows the theme instead of a fixed black.

## Theme

- Light and dark palettes are CSS variables defined in `src/theme.css`. The
  light palette is on `:root`; the dark palette applies under
  `:root[data-theme="dark"]` and, when no explicit light choice exists, under
  `@media (prefers-color-scheme: dark)`.
- By default the theme follows the OS `prefers-color-scheme` setting (light if
  it cannot be read).
- The toggle button sets `data-theme` on `<html>` to `light` or `dark` and
  stores that choice in `localStorage` under the key `theme`. A stored valid
  choice wins over the OS preference on the next load. An invalid stored value
  is ignored, and if storage is unavailable the choice lasts for the current
  page view.
- The theme choice is the only thing persisted. The counter value and count
  are not stored.
- Every text and background pair in the dark palette (and the light one) meets
  WCAG AA contrast (at least 4.5:1). This is enforced by
  `src/theme.contrast.test.js`.

## Testing

Tests run with Vitest, React Testing Library and jsdom (configured in
`vite.config.js`). Run them with `npm test`.

- `src/counterReducer.test.js`: initial state, each action's arithmetic
  including negative values, `reset` still counting as a click, no mutation of
  the previous state, a count that never decreases, and `valueTone`.
- `src/Counter.test.jsx`: the five buttons with their `data-action`
  attributes, each button's effect, the heading and `document.title` text
  (singular for one click), reset counting as a click, and the value colour
  tone at 0, 10, 11 and -1.
- `src/theme.test.jsx`: the default theme from `prefers-color-scheme`,
  toggling in both directions with the choice stored, restoring a stored
  choice over the OS preference, ignoring invalid stored values, a missing
  `matchMedia`, and a `localStorage` that throws.
- `src/theme.contrast.test.js`: the two dark palette blocks are identical,
  the explicit light theme restores the light values, `counter.css` uses the
  tested variables, and every palette meets the 4.5:1 contrast ratio.

## Architecture decisions

- [ADR 0001: single file vs build step](docs/adr/0001-single-file-vs-build-step.md)
  (superseded)
- [ADR 0002: Vite + React architecture](docs/adr/0002-react-vite-architecture.md)
