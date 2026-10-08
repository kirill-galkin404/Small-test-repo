# Counter app

A small counter built with Vite and React. The value can be incremented,
decremented, reset, increased by 4 or doubled; a click count is kept alongside
it, and the page has a light/dark theme.

## Requirements

- Node.js 18 or newer, with npm.

## Setup and scripts

```sh
npm install        # install dependencies
npm run dev        # start the Vite dev server with hot reload
npm run build      # production build into dist/
npm run preview    # serve the built dist/ over HTTP
npm test           # run the Vitest + React Testing Library suite once
```

`dist/` must be served over HTTP (`npm run preview` or any static file
server). Opening `dist/index.html` straight from the file system (`file://`)
does not work, because browsers generally block the module scripts Vite emits.

The old `counter.html` URL still works: `public/counter.html` is copied into
`dist/` and redirects to the root page with a meta refresh.

## Project layout

```
index.html               Vite entry page (mounts #root, loads src/main.jsx)
public/counter.html      meta-refresh redirect to ./ for old links
src/main.jsx             React entry point
src/Counter.jsx          Counter component (useReducer for state)
src/rules.js             Pure business rules: ACTIONS, reducer, colorFor, titleFor, thresholds
src/theme.js             useTheme hook and theme helpers
src/styles.css           Styles, including light and dark theme tokens
src/*.test.js(x)         Vitest tests (rules, theme, component, RULES.md drift check)
vite.config.js           Vite and Vitest configuration (jsdom, base './')
RULES.md                 Business rules, kept in sync with src/rules.js
docs/adr/                Architecture decision records
```

## How it works

- State lives in a `useReducer` inside the `Counter` component. It holds the
  current value and the click count.
- All rules live in `src/rules.js`, which has no React or DOM dependency, so
  they are unit-tested on their own. `Counter` only dispatches actions
  (`INCREMENT`, `DECREMENT`, `RESET`, `ADD_FOUR`, `DOUBLE`) and renders the
  result. Unrecognized actions are ignored.
- The previous global variables `c` and `cc` no longer exist. The value and
  click count are fields of the reducer state.
- The full rules, thresholds and quirk decisions are in [RULES.md](RULES.md).
  `src/rules-doc.test.js` partially checks that file against `src/rules.js`.

## Theme

- The theme is `light` or `dark`, applied as a `data-theme` attribute on the
  root element and styled in `src/styles.css`.
- On first visit the theme follows the browser's `prefers-color-scheme`
  setting (light if it is unavailable).
- The toggle button saves the choice in `localStorage` under the key
  `counter-theme`, and a saved choice wins over the system setting on later
  visits. If storage is unavailable the toggle still works but is not saved.

## Architecture decisions

- [ADR 0002](docs/adr/0002-react-vite-build.md): adopt Vite + React with a
  build step (accepted).
- [ADR 0001](docs/adr/0001-single-file-vs-build-step.md): stay single-file
  with no build step (superseded by ADR 0002).

A future change of architectural direction should come with a new ADR.
