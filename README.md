# Counter

A small counter widget built with React and Vite. It has five buttons, a value
that changes colour at fixed thresholds, a title that tracks how many times you
have clicked, and a light/dark theme toggle.

## Quick start

```sh
npm install
npm run dev
```

Then open the URL that Vite prints (usually http://localhost:5173).

Opening `index.html` directly from disk no longer works: it is a Vite entry
page that loads `/src/main.jsx` as a module. Use `npm run dev`, or run
`npm run build` and then `npm run preview` (or any static host that serves the
`dist/` folder). Vite's `base` is `/`, so `dist/index.html` does not work from
`file://` or from a sub-path.

## Scripts

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Starts the Vite dev server with hot reloading.  |
| `npm run build`   | Produces the production bundle in `dist/`.      |
| `npm run preview` | Serves the built `dist/` folder locally.        |
| `npm test`        | Runs the whole test suite once (`vitest run`).  |

## File structure

```
index.html            Vite entry page (mounts #root, loads src/main.jsx)
vite.config.js        Vite + React plugin, Vitest (jsdom) configuration
src/main.jsx          Creates the React root, imports styles.css
src/Counter.jsx       The counter component (useReducer + theme toggle)
src/logic.js          Pure logic: ACTIONS, initialState, reducer, valueTone, clickLabel
src/theme.js          useTheme hook and getInitialTheme helper
src/styles.css        Palette tokens for both themes and component styles
src/test-setup.js     Vitest setup (jest-dom matchers, matchMedia stub, cleanup)
src/logic.test.js     Logic tests: characterization and intentional changes
src/Counter.test.jsx  Component tests (buttons, title, colour thresholds)
src/theme.test.jsx    Theme toggle and default-theme tests
src/contrast.test.js  WCAG AA contrast test that reads the tokens in styles.css
docs/adr/             Architecture decision records
```

## Behaviour

- The value starts at 0 and has no lower or upper bound.
- Five buttons act on the value:
  - `+` adds 1
  - `-` subtracts 1
  - `reset` sets the value to 0
  - `+4` adds 4
  - `x2` doubles the value
- The title reads `Counter (N clicks)`. The click count goes up by one for
  every recognised action, **including `reset`**. It never goes down and
  `reset` does not clear it.
- Value colour: above 10 it is red, below 0 it is blue, and from 0 to 10
  (inclusive) it is the neutral text colour.
- State lives in memory only. Reloading the page starts again at 0.

## Theming

Palettes are defined as CSS custom properties in `src/styles.css`, in the
`:root[data-theme="light"]` and `:root[data-theme="dark"]` blocks. The
`useTheme` hook in `src/theme.js` sets the `data-theme` attribute on the
`<html>` element.

- The initial theme comes from the `prefers-color-scheme` media query: dark
  when the system prefers dark, light otherwise.
- The toggle button ("Switch to dark theme" / "Switch to light theme") flips
  the theme for the current page view.
- The choice is not stored anywhere. Reloading goes back to the system
  preference.

| Token             | Light     | Dark      |
| ----------------- | --------- | --------- |
| `--bg`            | `#ffffff` | `#121212` |
| `--text`          | `#000000` | `#f5f5f5` |
| `--value-neutral` | `#000000` | `#f5f5f5` |
| `--value-high`    | `#b00020` | `#ff8a80` |
| `--value-low`     | `#0b57d0` | `#8ab4f8` |
| `--btn-fg`        | `#ffffff` | `#ffffff` |
| `--btn-increment-bg` | `#1b5e20` | `#2e7d32` |
| `--btn-decrement-bg` | `#b00020` | `#c62828` |
| `--btn-reset-bg`  | `#595959` | `#616161` |
| `--btn-add-four-bg` | `#0b57d0` | `#1565c0` |
| `--btn-double-bg` | `#6a1b9a` | `#7b1fa2` |
| `--toggle-bg`     | `#e0e0e0` | `#333333` |
| `--toggle-fg`     | `#000000` | `#f5f5f5` |

Contrast: every value colour, the page text, the button labels and the toggle
label meet WCAG AA (at least 4.5:1) against their background in both themes.
`src/contrast.test.js` reads the tokens from `src/styles.css`, computes the
ratios, and fails if a token is missing from either theme.

## Differences from the original script

The widget was rewritten from a plain-script version. Behaviour is the same
except for three intentional changes:

1. **Own-property action lookup.** Only the five known action names are
   recognised. Inherited object keys such as `constructor` or `__proto__` are
   ignored and leave the state untouched.
2. **Count from the first render.** The title shows `Counter (0 clicks)` from
   the start instead of a bare `Counter`.
3. **Pluralisation.** After one click the title says `1 click`, not `1 clicks`.

The original per-dispatch `console.log` and unknown-action `console.warn` were
dropped: the reducer in `src/logic.js` is pure and does not log.

## Testing

```sh
npm test
```

Vitest runs in a jsdom environment with React Testing Library. Buttons are
looked up by accessible name (`+`, `-`, `reset`, `+4`, `x2`). The suites cover
the reducer, the component, the theme toggle and default theme, and the
contrast check.

## Architecture decisions

See [docs/adr/0002-adopt-vite-react-build.md](docs/adr/0002-adopt-vite-react-build.md)
for why the project moved to a Vite, React and Vitest build. It supersedes
[ADR 0001](docs/adr/0001-single-file-vs-build-step.md), which had chosen a
single file with no build step.
