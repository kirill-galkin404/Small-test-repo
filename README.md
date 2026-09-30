# Counter Widget

A small counter widget: increment, decrement, reset, add-four and double
buttons acting on a numeric value, with a click counter shown in the
heading and a value color that changes based on the current value. The
project is built with [Vite](https://vitejs.dev/) and
[React](https://react.dev/) 18.

## Architecture

- **`index.html`** (repo root) is the real Vite entry point. It contains a
  `<div id="root"></div>` and loads `src/main.jsx` as an ES module, which
  mounts the React application into that div via `createRoot`.
- **`src/main.jsx`** is the mount entry: it imports `src/theme.css` and
  renders `App` inside `React.StrictMode`.
- **`src/App.jsx`** is the top-level component; it renders `ThemeToggle`
  and `Counter`.
- **`src/Counter.jsx`** renders the counter's heading, value display and
  the five action buttons (`+`, `-`, `reset`, `+4`, `x2`), and drives its
  state with `useReducer`.
- **`src/counterReducer.js`** is the reducer (`(state, action) => state`)
  that implements the counter's business rules — increment, decrement,
  reset, add-four and double, plus the separate click counter — and is
  covered by `src/counterReducer.test.js`.
- **`src/displayColor.js`** is a pure function mapping the current counter
  value to a semantic color state (`'positive-high'`, `'negative'` or
  `'neutral'`), covered by `src/displayColor.test.js`.
- **`src/theme.css`** defines light/dark CSS custom properties (colors for
  buttons and for each value state), selected either by the OS
  `prefers-color-scheme` media query or by an explicit `data-theme`
  attribute on `<html>`.
- **`src/useTheme.js`** is a hook that reads/writes the user's explicit
  dark-mode preference to `localStorage` (falling back to the OS
  preference when nothing has been chosen yet), and **`src/ThemeToggle.jsx`**
  is the button component that uses it to let the user override the OS
  theme.
- **`public/counter.html`**, served at `/counter.html`, is a static
  compatibility redirect to `index.html`. It preserves the old
  `counter.html` URL/bookmarks from before the rewrite, per
  [docs/adr/0002-react-vite-rewrite.md](docs/adr/0002-react-vite-rewrite.md);
  it carries no application logic, and Vite copies it into `dist/`
  unmodified on build.

## Install and run

```sh
npm install     # install dependencies
npm run dev     # start the Vite dev server
npm run build   # production build; outputs to dist/, including both
                # index.html and counter.html
npm run test    # run the Vitest suite (npm test also works)
```

## Behavior and decisions

- [RULES.md](RULES.md) is the source of truth for the counter's
  business rules and behavior (the recognized actions, the click-counter
  semantics, the value color thresholds, and the heading format) — the
  reducer and color function above are implemented and tested against it.
- [docs/adr/0002-react-vite-rewrite.md](docs/adr/0002-react-vite-rewrite.md)
  records the decision to introduce a build step (Vite + React) for the
  counter widget, superseding the no-build-step, single-file decision in
  `docs/adr/0001-single-file-vs-build-step.md`.
