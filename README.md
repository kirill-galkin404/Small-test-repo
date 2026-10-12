# Counter app

A small counter built with React and bundled by Vite. The page shows a number
and five buttons that change it.

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run build` — produce the production bundle in `dist/`. The JavaScript
  and `style.css` are bundled by Vite and emitted as hashed files under
  `dist/assets/`; `base: './'` keeps the asset URLs relative.
- `npm test` — run the Vitest suite once (jsdom environment).
- `npm run preview` — serve the built `dist/` locally.

The ES-module build cannot be opened straight from `file://`; serve it with
`npm run dev` or `npm run preview`.

## Architecture

All code lives in external module files, bundled by Vite — there are no
script blocks written into the HTML pages.

- `src/Counter.jsx` — the `Counter` component. It uses `useReducer` and
  renders the title, the number and one button per action. Each button
  carries a `data-action` attribute holding the action name.
- `src/reducer.js` — a pure `reducer(state, action)` plus the `ACTION` map and
  `initialState`.
- `src/main.jsx` — mounts `<Counter />` into `#root` and imports `style.css`.

### State

Only two values are kept:

- `value` — the displayed number, starting at `0`.
- `clicks` — how many recognised actions have been applied, starting at `0`.

### Actions

| Action      | Button | Effect on `value`   |
| ----------- | ------ | ------------------- |
| `INCREMENT` | `+`    | `value + 1`         |
| `DECREMENT` | `-`    | `value - 1`         |
| `RESET`     | `reset`| `0`                 |
| `ADD_FOUR`  | `+4`   | `value + 4`         |
| `DOUBLE`    | `x2`   | `value * 2`         |

Every recognised action also adds one to `clicks` (`RESET` included; `clicks`
is never reset). Each `case` in the reducer ends with its own `break`
individually, and the click tally is bumped only after the `switch`, so it
counts recognised actions only. An unknown action takes the `default` branch
and returns early with the very same state object, unchanged and uncounted.
There is no shared-tail shortcut between cases.

### Display

- Title: `Counter` before any click, then `Counter (N clicks)`.
- Number colour: red when `value > 10`, blue when `value < 0`, otherwise
  black.

## File layout

- `index.html` — Vite entry page (contains `#root`).
- `public/counter.html` — copied to `dist/` as-is; redirects to `index.html`
  so older links keep working.
- `style.css` — button and number styling, keyed off `data-action` and `#d`.
- `src/` — `Counter.jsx`, `reducer.js`, `main.jsx`.
- `tests/` — Vitest suites: `reducer.test.js`, `Counter.test.jsx`,
  `counter.behaviour.test.js`, `styles.test.js`.
- `tests/helpers/mount.js` — the shared behaviour suite used by the DOM tests.
- `vite.config.js` — React plugin, relative `base`, and Vitest settings.
- `docs/adr/` — architecture decision records.

## Architecture decisions

See [docs/adr/0002-react-vite-build-step.md](docs/adr/0002-react-vite-build-step.md)
for why the app moved to React and a Vite build step. It supersedes
[ADR 0001](docs/adr/0001-single-file-vs-build-step.md). Read it before making
structural changes.
