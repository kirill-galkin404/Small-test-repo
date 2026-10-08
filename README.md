# Counter

A small counter app with `+`, `-`, reset, `+4` and `x2` buttons. The number of clicks is shown in the page title.

## Structure

- `src/counterRules.js` — pure rules core: `ACTION_TYPES`, `initialState`, `counterReducer`, `valueTone`, `titleText`.
- `src/Counter.jsx` — React component using `useReducer`.
- `src/counter.css` — dark theme: CSS variables and tone classes.
- `src/main.jsx` — entry point.
- `index.html` — Vite entry.
- `public/counter.html` — redirect to `./` so old `counter.html` links keep working; copied to `dist/`.
- Tests: `src/counterRules.test.js`, `src/Counter.test.jsx`, `src/theme.test.js`.

## Commands

```
npm install        # install dependencies
npm run dev        # start the dev server
npm run build      # production build into dist/
npm run preview    # serve dist/ (must be served over http, not opened via file://)
npm test           # run the test suite
```

## Theme

A single dark theme (no toggle). Contrast is verified by a test (`src/theme.test.js`).

## Docs

- [RULES.md](RULES.md)
- [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md) (superseded)
- [docs/adr/0002-vite-react-rewrite.md](docs/adr/0002-vite-react-rewrite.md)
