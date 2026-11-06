# Counter app

A small counter page built with React and Vite (plain JavaScript).

## Setup

```sh
npm install
npx playwright install chromium   # once, for the tests
```

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — build the app into `dist/`.
- `npm run preview` — serve the built app locally.
- `npm run test:legacy` — run the Playwright suite against a frozen copy of the
  original page in `tests/fixtures/legacy-counter/`.
- `npm run test:react` — build and serve the app, then run the same suite (plus
  the `/counter.html` redirect test) against it.

The built app must be served over HTTP; opening `dist/index.html` straight from
disk is not supported.

## Structure

- `index.html` — Vite entry page with the `#root` mount point.
- `src/main.jsx` — mounts `Counter` into `#root` and imports `style.css`.
- `src/Counter.jsx` — the single `Counter` component. `c` (value) and `cc`
  (click tally) live in `useState`; the value color (red above 10, blue below 0,
  otherwise black) and the title (`Counter` until the first click, then
  `Counter (N clicks)`) are derived while rendering. Every button, including
  reset, adds one to the tally.
- `style.css` — page styling, selected by each button's `data-action` attribute.
- `public/counter.html` — redirects the old `/counter.html` URL to the app.
- `tests/counter.spec.js` — characterization suite shared by both Playwright
  projects; `tests/url-compat.spec.js` runs on the React project only.

See [docs/adr/0002-adopt-react-with-vite-build-step.md](docs/adr/0002-adopt-react-with-vite-build-step.md)
for why the project uses a build step; it supersedes
[ADR 0001](docs/adr/0001-single-file-vs-build-step.md).
