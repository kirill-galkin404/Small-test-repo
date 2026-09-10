# Counter widget

A small React counter widget, built and tested with Vite and Vitest.

## Architecture

- `index.html` is the Vite HTML entry point; it mounts `src/main.jsx` into
  `#root`.
- `src/Counter.jsx` is the component: it renders the title, the numeric
  display, and five buttons (`+`, `-`, `reset`, `+4`, `x2`), each wired to
  its own `onClick` handler.
- `src/counterReducer.js` holds all state and behavior: a `useReducer`
  reducer that is the single entry point for state transitions. State is
  `{ c, cc }`, where `c` is the numeric counter value shown on screen and
  `cc` is a separate click counter shown only in the title.
- `src/Counter.css` styles the display and all five buttons.

See [RULES.md](RULES.md) for the full set of business rules (actions,
colour thresholds, click-count/title behaviour, and the unrecognized-action
contract), and
[docs/adr/0002-react-toolchain-supersedes-0001.md](docs/adr/0002-react-toolchain-supersedes-0001.md)
for why the project moved from a single static file to this toolchain.

## Commands

Install dependencies:

```
npm install
```

Run the app in development mode:

```
npm run dev
```

Build the app for production:

```
npm run build
```

Run the test suite:

```
npm test
```
