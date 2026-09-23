# Counter Widget

A small React application implementing a counter widget with a light/dark
theme toggle, built and served with Vite.

## Entry point

`index.html` is the real ESM entry point. It contains a single `<div
id="root">` and loads `src/main.jsx` as a module script, which mounts the
React application into that element:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

There is no application state or logic embedded in `index.html` itself —
all behavior lives in the `src/` files below.

## Source layout

- **`src/main.jsx`** — entry point; renders the root `<App />` component
  into `#root`.
- **`src/App.jsx`** — root component; renders the theme toggle and the
  counter widget.
- **`src/Counter.jsx`** — the counter UI, including the value display and
  the five action buttons, each wired to its own click handler.
- **`src/counterReducer.js`** — the pure reducer implementing the widget's
  five actions and the `-20..20` clamp on the resulting value.
- **`src/colorForValue.js`** — maps the current counter value to a color
  token used to style the displayed number.
- **`src/theme.css`** — light/dark theme styles, defined as CSS custom
  properties.
- **`src/ThemeToggle.jsx`** — the button component used to switch between
  light and dark themes.

See [RULES.md](RULES.md) for the counter widget's business rules
(the recognized actions, the value clamp, color thresholds, and other
behavioral detail).

## Development

This project uses [Vite](https://vitejs.dev/) for both the dev server and
the production build.

```sh
npm install     # install dependencies
npm run dev     # start the local Vite dev server
npm run build   # produce a production build
```

## Architecture history

- [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
  records the original decision to keep the widget single-file, with no
  build step.
- [docs/adr/0002-react-build-step-supersedes-0001.md](docs/adr/0002-react-build-step-supersedes-0001.md)
  records the later decision to supersede that choice and adopt the
  React/Vite build step described in this README.
