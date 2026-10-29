# Counter app

A small counter built with [React](https://react.dev) and [Vite](https://vite.dev).
State lives in memory only: reloading the page resets it.

## Setup

Requires Node.js 22.12 or newer (22.x, 24.x or 26+) and npm. The `engines` field in `package.json` records this range.

```sh
npm ci            # install exact versions from package-lock.json
npm run dev       # start the Vite dev server
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm test          # run the Vitest suite (jsdom + React Testing Library)
```

## Usage

`counter.html` shows a heading, the current value and five buttons:

| Button  | `data-action` | Effect             |
| ------- | ------------- | ------------------ |
| `+`     | `INCREMENT`   | adds 1             |
| `-`     | `DECREMENT`   | subtracts 1        |
| `reset` | `RESET`       | sets the value to 0 |
| `+4`    | `ADD_FOUR`    | adds 4             |
| `x2`    | `DOUBLE`      | doubles the value  |

- The value has no lower or upper bound and may go negative.
- The heading reads `Counter` until the first click, then `Counter (N clicks)`.
  Every action, including `reset`, adds one to N; `reset` does not reset N.
- The value is red when greater than 10, blue when less than 0, and black
  otherwise.
- Clicks anywhere other than the buttons do nothing.

## Entry pages

`index.html` is a static page that redirects to `counter.html` with a
`<meta http-equiv="refresh">` tag (and a fallback link). `counter.html` is the
Vite entry: it contains a `#root` element and loads `src/main.jsx`. Both pages
are build inputs, and there is no client-side router.

## Project structure

- `src/counterReducer.js` – pure reducer over `{ c, cc }` (value and click count).
- `src/Counter.jsx` – the counter component, using `useReducer`.
- `src/main.jsx` – mounts `Counter` into `#root` and imports `style.css`.
- `src/*.test.*` – unit, component and entry tests.
- `style.css` – styles, keyed on `#d` and the buttons' `data-action` attributes.
- `vite.config.js` – Vite, React plugin and Vitest configuration.

## Deployment

`counter.html` references `/src/main.jsx`, so the repository root cannot be
served or opened directly any more. Run `npm run build` and serve `dist/`
(built with a relative base, `./`).

## Architecture decisions

- [ADR 0002: Adopt a Vite + React build step](docs/adr/0002-adopt-vite-react-build-step.md)
- [ADR 0001: Single-file vs. build step](docs/adr/0001-single-file-vs-build-step.md) (superseded)
