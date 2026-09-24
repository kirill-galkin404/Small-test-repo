
## Development notes

The counter widget is a small React 18 + Vite app. Its behaviour is fully
specified by [RULES.md](./RULES.md), which is the normative, exhaustive
description of the widget's state, actions, guard conditions and render
rules — any change to the code below must stay consistent with it.

The React structure:

- `src/actions.js` — the frozen `ACTION` enum (`INCREMENT`, `DECREMENT`,
  `RESET`, `ADD_FOUR`, `DOUBLE`), the 5 dispatchable action values.
- `src/reducer.js` — `counterReducer(state, action)`, a pure reducer holding
  a transition table for the 5 actions. It updates `c` per the matched
  action and increments `cc` by exactly 1 on any recognized action; an
  unrecognized action returns the state unchanged (no-op guard).
- `src/Counter.jsx` — the `Counter` component. Uses `useReducer` to hold
  `{ c, cc }` state, renders the title, the colour-coded counter value, and
  the 5 action buttons, dispatching the matching `ACTION` on click.
- `src/main.jsx` — the app entry point; mounts `<Counter />` into the
  `#root` element via `react-dom/client`'s `createRoot`.
- `index.html` — the Vite entry HTML page. It contains just the `#root`
  mount element and a `<script type="module" src="/src/main.jsx">` tag that
  loads the app; there is no application logic embedded in this file.

### Running and testing

```sh
npm install
npm run dev   # start the Vite dev server
npm test      # run the reducer/component test suite (vitest run)
```

### Architecture decisions

This rewrite is governed by two ADRs:

- [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md) —
  originally decided to keep the widget single-file with no build step.
- [docs/adr/0002-adopt-vite-react-build-step.md](docs/adr/0002-adopt-vite-react-build-step.md) —
  supersedes ADR 0001, adopting the Vite/React build step and reducer
  architecture that this repository now uses.
