# Counter

A small counter widget, re-platformed as a React single-page app built with
Vite and tested with Vitest.

For the app's business rules (the five counter actions, dispatch
validation, color thresholds, and the entry redirect), see
[RULES.md](RULES.md) — this README does not restate them.

## Stack

- **React** for the UI (`src/App.jsx`, `src/components/Counter.jsx`).
- **Vite** for the dev server and production build.
- **Vitest** + **@testing-library/react** for unit and component tests,
  running in a `jsdom` environment.

The four business rules are implemented as pure, DOM-free modules under
`src/rules/` (`arithmetic.js`, `dispatch.js`, `color.js`, `routing.js`),
each with its own Vitest suite.

## Development notes

- State (`c`, the counter value, and `cc`, the recognized-dispatch count)
  lives in the `Counter` component's `useReducer` state, driven by the pure
  reducer in `src/rules/dispatch.js`.
- Button clicks are wired with per-button `onClick` handlers keyed off each
  button's `data-action` attribute, calling `dispatch` from
  `src/rules/dispatch.js`.
- `dispatch(state, actionCode)` is the single entry point for computing the
  next state; it delegates arithmetic to `src/rules/arithmetic.js` and
  leaves state unchanged for an unrecognized action code.

See [docs/adr/0002-react-rewrite-toolchain.md](docs/adr/0002-react-rewrite-toolchain.md)
for the decision to introduce the React + Vite + Vitest toolchain,
superseding [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md).

## Getting started

Requires Node.js and npm.

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# run the test suite
npm run test

# lint the source
npm run lint

# build a production bundle
npm run build
```
