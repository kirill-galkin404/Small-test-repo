# Counter App

A small counter built with Vite and React.

## Behaviour

- Five buttons: `+`, `-`, `reset`, `+4` and `x2`.
- The value is shown in red when it is above 10 and in blue when it is below 0.
- The title shows the number of button clicks so far, e.g. `Counter (3 clicks)`.

## Prerequisites

- Node.js ^22.13 or >= 24 (see `engines` in `package.json`)
- npm

## Commands

```sh
npm install        # install dependencies
npm run dev        # start the dev server with hot reload
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm test           # run the unit and component tests once
```

## Deployment notes

- `dist/` must be served over HTTP; opening `dist/index.html` via `file://`
  will not work.
- If the app is hosted under a subpath (e.g. `https://example.com/counter/`),
  set Vite's [`base`](https://vite.dev/config/shared-options.html#base) option
  in `vite.config.js` to that subpath before building.

## Project structure

```
docs/adr/0001-single-file-vs-build-step.md
docs/adr/0002-adopt-vite-react-build-step.md
index.html                   Vite entry HTML
package.json
vite.config.js               Vite and Vitest configuration
src/main.jsx                 React entry point
src/App.jsx                  Counter UI
src/App.test.jsx             Component tests
src/counterReducer.js        State transitions
src/counterReducer.test.js   Reducer tests
src/style.css                Styles
```

## Architecture

See [docs/adr/0002-adopt-vite-react-build-step.md](docs/adr/0002-adopt-vite-react-build-step.md)
for why the project uses a build step.
