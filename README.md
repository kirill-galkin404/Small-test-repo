# Counter app

A small counter built with React and Vite. The `Counter` component
(`src/Counter.jsx`) keeps its state with `useReducer`, driven by a pure
`counterReducer` in `src/counterReducer.js`. Each button has its own `onClick`
handler. State lives in memory only, so a page reload starts again from zero.

## Prerequisites

- Node >=22.12 (see `engines` in `package.json`)

## Commands

```sh
npm install      # install dependencies
npm run dev      # start the Vite dev server
npm run build    # produce a production build
npm test         # run the unit and component tests (Vitest)
```

## Usage

There are five buttons:

| Label   | Action      | Effect                    |
| ------- | ----------- | ------------------------- |
| `+`     | `INCREMENT` | adds 1                    |
| `-`     | `DECREMENT` | subtracts 1               |
| `reset` | `RESET`     | sets the value to 0       |
| `+4`    | `ADD_FOUR`  | adds 4                    |
| `x2`    | `DOUBLE`    | doubles the value         |

- **Title:** it reads `Counter` until the first action, then
  `Counter (n clicks)`. The click count `n` counts every recognized action,
  including `RESET`, and `RESET` does not clear it.
- **Value colour:** red above 10, blue below 0, black otherwise (10 and 0 are
  black).
- **Unrecognized actions** are ignored, and a warning is written to the browser
  console.
- **Legacy URL:** `counter.html` redirects to the app root (a meta refresh in
  `public/counter.html`).

## Architecture

See [docs/adr/0002-adopt-react-and-vite.md](docs/adr/0002-adopt-react-and-vite.md)
for the decision to adopt React and Vite. It supersedes ADR 0001
([docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)).
