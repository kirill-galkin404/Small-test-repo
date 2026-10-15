# Counter

A small counter app built with Vite and React 18 (plain JS/JSX). It replaces
the previous single-file page, as recorded in
[ADR 0002](docs/adr/0002-adopt-vite-react.md).

## Requirements

Node 18 or newer.

## Commands

```sh
npm install      # install dependencies
npm run dev      # start the Vite dev server
npm run build    # production build into dist/
npm test         # run the Vitest suite once (jsdom)
```

`npm run preview` serves the built `dist/` locally.

## Behaviour

State is `{ value, clicks }`, starting at `{ value: 0, clicks: 0 }`.

| Button  | Effect on value |
| ------- | --------------- |
| `+`     | add 1           |
| `-`     | subtract 1      |
| `reset` | set to 0        |
| `+4`    | add 4           |
| `x2`    | double          |

- Every recognised action adds 1 to `clicks`, including `reset`; `reset` does
  not clear `clicks`.
- An unknown action type logs a `console.warn` and leaves the state unchanged
  (the same object is returned). No other console output is produced.
- The heading is `Counter` while `clicks` is 0, otherwise
  `Counter (N clicks)`, for example `Counter (1 clicks)`.
- The value colour depends on its tone: `high` when the value is above 10,
  `negative` when it is below 0, and `default` otherwise.

## Project structure

```
index.html              Vite entry page (#root and the module script)
vite.config.js          React plugin and Vitest config (jsdom, setup file)
src/
  main.jsx              mounts <Counter /> in StrictMode, imports theme.css
  Counter.jsx           the component: heading, value and five buttons
  counterReducer.js     pure state logic: ACTIONS, initialState,
                        counterReducer, toneFor, headingFor
  theme.css             dark theme and component styles
  Counter.test.jsx      component tests (React Testing Library)
  counterReducer.test.js  reducer, tone and heading tests
  theme.test.js         theme token and contrast tests
  test/
    parityCases.js      data-only cases that pin the original behaviour
    setup.js            jest-dom matchers and per-test cleanup
```

## Dark theme

The app is dark only, with no toggle. `src/theme.css` sets
`color-scheme: dark` and defines its colours as CSS custom properties on
`:root`:

- Surface and text: `--color-bg`, `--color-surface`, `--color-text`.
- Value tones: `--color-default`, `--color-high`, `--color-negative`. Each has
  at least 4.5:1 contrast against `--color-bg`, which `theme.test.js` checks.
- Buttons: `--color-btn-text` plus one background token per button
  (`--color-btn-increment`, `--color-btn-decrement`, `--color-btn-reset`,
  `--color-btn-add-four`, `--color-btn-double`).

## Notes

- The previous single-file page no longer exists, and nothing redirects from
  its old URL. External bookmarks to it are unchecked and may break.
- Opening the app now needs `npm install` followed by `npm run dev` or
  `npm run build`.
