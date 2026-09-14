# Counter Widget

A small counter app, built with [React](https://react.dev/) and
[Vite](https://vitejs.dev/). See
[docs/adr/0002-react-vite-build-step.md](docs/adr/0002-react-vite-build-step.md)
for the decision record behind the React + Vite build step (which
supersedes the earlier single-file, no-build-step approach), and
[RULES.md](RULES.md) for the authoritative behaviour contract that this
app's logic must satisfy.

`counter.html`, `counter.js`, and `style.css` at the repo root are kept as
a legacy reference implementation for now and are not part of the active
app.

## Project layout

- `index.html` — Vite entry HTML page, loads `src/main.jsx`.
- `src/main.jsx` — application entry point; mounts the root React component.
- `src/App.jsx` — the app root component.
- `src/components/` — React components that render the counter UI (display,
  buttons, etc.).
- `src/state/` — the reducer that implements the counter's mutation rules,
  plus pure display helper functions (e.g. deriving the display color from
  the counter value).
- `src/index.css` — application styling.

Some of the files above are still being built out as the React rewrite
progresses; this layout describes the intended, target architecture.

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — build a production bundle with Vite.
- `npm run test` (or `npx vitest run`) — run the test suite with Vitest.
