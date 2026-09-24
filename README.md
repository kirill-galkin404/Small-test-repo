# Counter Widget

A small counter widget built with [Vite](https://vitejs.dev/) and
[React](https://react.dev/). It renders a numeric counter with buttons to
increment, decrement, reset, add four, and double the current value, plus a
title that tracks how many actions have been dispatched.

## Architecture

- `index.html` is the Vite entry point. It contains a single `<div id="root">`
  and loads `src/main.jsx` as an ES module.
- `src/main.jsx` mounts the `<Counter />` component into `#root` using
  `react-dom/client`'s `createRoot`.
- `src/Counter.jsx` is the UI component. It wires up React's `useReducer`
  hook to the reducer in `src/reducer.js`, derives what to display via
  `src/formatter.js`, and attaches one `onClick` handler per button (`+`,
  `-`, `reset`, `+4`, `x2`). It imports `src/theme.css` for styling.
- `src/reducer.js` is a pure, framework-free reducer. State has the shape
  `{ value: number, clicks: number }`. It handles five actions —
  `INCREMENT`, `DECREMENT`, `RESET`, `ADD_FOUR`, and `DOUBLE` — each of
  which updates `value` accordingly and increments `clicks`. Any
  unrecognized action is guarded against and leaves state completely
  unchanged.
- `src/formatter.js` holds pure display-formatting logic: `formatDisplay`
  categorizes the current value as `'red'` (> 10), `'blue'` (< 0), or
  `'black'` (otherwise), and `formatTitle` builds the "Counter (N clicks)"
  title text from `clicks`.
- `src/theme.css` provides a dark-by-default theme using CSS custom
  properties (background, text, heading, button, and value colors).

Pure logic (`reducer.js`, `formatter.js`) is kept separate from UI/rendering
code (`Counter.jsx`) — see [RULES.md](RULES.md) for the module boundaries
this project follows, and [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
and [docs/adr/0002-react-vite-migration.md](docs/adr/0002-react-vite-migration.md)
for the architectural decisions behind the current Vite/React structure.

## Commands

Install dependencies:

```sh
npm install
```

Start the Vite dev server (with hot module reloading):

```sh
npm run dev
```

Build a production bundle:

```sh
npm run build
```

Run the test suite (Vitest):

```sh
npm test
```

or equivalently:

```sh
npm run test
```

## Tests

Unit tests live alongside the source they cover, under `src/*.test.js` and
`src/*.test.jsx` (e.g. `src/reducer.test.js`, `src/formatter.test.js`), and
are run via `npm test`.
