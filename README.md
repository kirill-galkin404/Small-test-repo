# Counter app

A small counter built with React and Vite. The counter value, the page title and
the value colour are all derived from a plain state model.

## Prerequisites

- Node.js 18 or newer (with npm)

## Getting started

```sh
npm install        # install dependencies
npm run dev        # start the Vite dev server with hot reload
npm run build      # produce a production bundle in dist/
npm run preview    # serve the production bundle locally
npm test           # run the unit tests
```

Use `npm run dev` or `npm run preview` to view the app. Opening
`dist/index.html` straight from disk is unreliable because browsers block
module scripts on `file://` URLs.

State lives in memory only, so it resets whenever the page is reloaded.

## Behavior

- The title is `Counter` until the first recognised click, then
  `Counter (N clicks)`.
- The value is red above 10, blue below 0 and black otherwise.
- Unknown actions log a warning and leave the state unchanged.

## Source layout

- `index.html` – Vite entry page that loads `src/main.jsx`.
- `src/main.jsx` – mounts the React app.
- `src/Counter.jsx` – the counter component; renders the value and the buttons
  and takes the title and colour from the model.
- `src/counterModel.js` – the action constants and the pure reducer/derivation
  logic, with no React dependency so it can be tested directly.
- `style.css` – styles for the value and the action buttons.

See [docs/adr/0002-adopt-react-vite-build.md](docs/adr/0002-adopt-react-vite-build.md)
for the decision to adopt React and Vite. It supersedes
[docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md).
