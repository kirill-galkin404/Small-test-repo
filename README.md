
## Development notes

- The counter widget is built with [Vite](https://vite.dev/) and
  [React](https://react.dev/) from the `app/` directory.
- `app/src/counterReducer.js` is a pure reducer exporting a frozen `ACTION`
  map (`INCREMENT`, `DECREMENT`, `RESET`, `ADD_FOUR`, `DOUBLE`) and a
  `counterReducer(state, action)` function. State is `{ c, cc }`, where `c`
  is the display value and `cc` counts every matched action (shown as
  clicks in the title). Unrecognized actions return the state unchanged and
  do not increment `cc`.
- `app/src/Counter.jsx` renders the title, display, and five buttons from a
  single `useReducer(counterReducer, { c: 0, cc: 0 })` call. Each button
  dispatches its own `{ type: ACTION.X }` action directly via `onClick` —
  there is no delegated click listener or `data-action` attribute.
- `app/src/Counter.css` holds the component's styling as class selectors
  (imported directly by `Counter.jsx`) instead of global attribute
  selectors.
- Run `npm install && npm run dev` inside `app/` for a local dev server, or
  `npm run build` to produce a production build in `app/dist/`.
- Run `npm test` inside `app/` to run the Vitest suite, which covers all
  five reducer actions, the unmatched-action no-op, and a component render
  test asserting the display colour thresholds and title text.

See [docs/adr/0002-vite-react-migration.md](docs/adr/0002-vite-react-migration.md)
for the architectural decision to introduce a build step, ES modules, and
React for the counter widget, which supersedes
[docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md).
