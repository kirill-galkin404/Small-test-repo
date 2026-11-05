# Counter app

A small counter built with React, bundled with Vite and tested with Vitest.

## Stack

- **React** 18 (`useReducer` for state)
- **Vite** 5 (dev server and build)
- **Vitest** 2 with Testing Library and jsdom

## Prerequisites

Node.js 18 or newer (`engines.node` in `package.json` is `>=18`) and npm.

## Setup and scripts

```
npm install        # install dependencies
npm run dev        # start the Vite dev server
npm run build      # production build into dist/
npm test           # run the Vitest suite once
npm run preview    # serve the built dist/ locally
```

`vite.config.js` sets `base: './'`, so the build uses relative asset paths.
Publishing `dist/` is out of scope for this repository.

`counter.html` is a redirect. It lives in `public/`, so Vite copies it to the
build output as-is; it uses a relative meta refresh (`url=./`) that sends old
links to the app at the root.

## Folder structure

```
index.html                 Vite entry; mounts <div id="root"> and loads src/main.jsx
vite.config.js             React plugin, relative base, Vitest (jsdom) config
public/
  counter.html             redirect to the root via relative meta refresh
src/
  main.jsx                 renders <Counter /> in StrictMode
  Counter.jsx              the Counter component
  counterReducer.js        ACTION enum, initialState, counterReducer
  valueColor.js            value -> colour
  style.css                styles
  setupTests.js            registers jest-dom matchers for Vitest
  *.test.js / *.test.jsx   unit and component tests
docs/adr/                  architecture decision records
```

## Design

### `counterReducer`

A pure reducer in `src/counterReducer.js`. State is `{ value, clicks }`, starting
at `{ value: 0, clicks: 0 }`. Actions are members of the frozen `ACTION` enum:
`INCREMENT` (+1), `DECREMENT` (-1), `RESET` (value to 0), `ADD_FOUR` (+4) and
`DOUBLE` (x2). Every recognised action returns a new state with `clicks`
incremented by one, so `RESET` clears `value` but does not reset `clicks` (it
counts as a click). An unrecognised action logs a warning with `console.warn`
and returns the same state object unchanged. The value has no upper bound.

### `valueColor`

`valueColor(value)` in `src/valueColor.js` returns `red` when the value is
above 10, `blue` when it is below 0, and `black` otherwise (so 0 and 10 are
black).

### `Counter` component

`src/Counter.jsx` holds state with `useReducer(counterReducer, initialState)`.
The heading reads `Counter` until the first click and `Counter (N clicks)`
afterwards. The value is shown in `<p id="d">` coloured by `valueColor`. Five
buttons dispatch the actions, in order: `+`, `-`, `reset`, `+4` and `x2`.

## Tests

`npm test` runs Vitest in a jsdom environment. `counterReducer.test.js` and
`valueColor.test.js` cover the logic (including the unknown-action warning and
the colour boundaries); `Counter.test.jsx` renders the component and checks the
heading, buttons, value and colour.

## Architecture decisions

- [docs/adr/0002-adopt-react-vite-build-step.md](docs/adr/0002-adopt-react-vite-build-step.md)
  records the move to React, Vite and a build step. Read it before making
  structural changes.
- [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
  is the earlier decision that it supersedes.
