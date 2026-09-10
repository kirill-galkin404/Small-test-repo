# Counter Widget

A small counter widget built as a Vite + React application. It displays a
running count and a click counter, and exposes five actions (increment,
decrement, reset, add four, double) implemented as a pure reducer.

## Getting Started

Install dependencies:

```
npm install
```

## Development

Start the Vite dev server with hot module reloading:

```
npm run dev
```

## Build

Produce an optimized production build in `dist/`:

```
npm run build
```

## Test

Run the Vitest suite, which covers both the reducer's unit behavior and the
React component rendering/interaction (via React Testing Library):

```
npm test
```

## Project layout

- `src/main.jsx` — application entry point; mounts `<App />` into the DOM.
- `src/App.jsx` — top-level component that renders `<Counter />`.
- `src/Counter.jsx` — owns the widget's state via React's `useReducer` hook
  and renders the display plus the action buttons.
- `src/ActionButton.jsx` — a small reusable button component used for each
  action.
- `src/counterReducer.js` — a pure reducer implementing the five supported
  actions (increment, decrement, reset, add four, double).
- `src/index.css` — styles for the widget.

## Development notes

- All state (the current count and the click count) is owned by React's
  `useReducer` hook inside `src/Counter.jsx` — it is component state, not
  global or DOM-attached state.
- Each action button wires its own `onClick` handler directly to an
  `ActionButton` component, which dispatches the corresponding action; there
  is no shared/delegated click listener.
- `counterReducer` is the single entry point for state changes: every action
  case returns a new state object, incrementing the click count alongside
  the count-specific update.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision that led to adopting the Vite + React build
step. See `RULES.md` (if present) for the business-rules specification that
the reducer and components must satisfy.
