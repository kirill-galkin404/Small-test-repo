# Counter app

A small counter built with React and bundled with Vite. Tests use Vitest and
React Testing Library.

## Requirements

Node `^22.13.0 || >=24.0.0` (see `engines` in `package.json`) and npm.

## Commands

```sh
npm install        # install dependencies
npm run dev        # start the Vite dev server
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm test           # run the Vitest suite once
```

## Behaviour

State lives in memory only and starts at 0; nothing is persisted. Five buttons
act on the value:

| Button  | `data-action` | Effect       |
| ------- | ------------- | ------------ |
| `+`     | `INCREMENT`   | value + 1    |
| `-`     | `DECREMENT`   | value - 1    |
| `reset` | `RESET`       | value = 0    |
| `+4`    | `ADD_FOUR`    | value + 4    |
| `x2`    | `DOUBLE`      | value x 2    |

Every action, including `reset`, counts as a click. The heading reads
`Counter` until the first click, then `Counter (N clicks)`. The value turns red
above 10, blue below 0, and is black otherwise (the colour is set via the
`style` attribute).

## Structure

- `src/counterReducer.js` — exports `ACTION`, `initialState` and the pure
  `counterReducer` over `{ value, clickCount }`. Unknown actions log a warning
  and leave state unchanged.
- `src/Counter.jsx` — the component. It uses `useReducer`, gives each button its
  own `onClick` and a `data-action` attribute, and renders the heading, value
  and buttons.
- `src/main.jsx` — mounts `Counter` into `#root` and imports `style.css`.
- `counter.html` — the app page; loads `src/main.jsx`.
- `index.html` — a static redirect: a 0-second meta refresh with a fallback link
  to `counter.html`. It stays plain HTML so it works without JavaScript.
- `style.css` — shared styles, reused unchanged.
- `src/counterReducer.test.js` — reducer tests.
- `src/Counter.test.jsx` — component tests (the five operations, colour
  thresholds, headings).

## Architecture decisions

See [docs/adr/0002-adopt-react-and-build-step.md](docs/adr/0002-adopt-react-and-build-step.md)
for why the app uses React and a Vite build step. It supersedes
[ADR 0001](docs/adr/0001-single-file-vs-build-step.md).
