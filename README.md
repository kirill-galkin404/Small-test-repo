# Counter

A small counter app built with React and Vite (plain JavaScript/JSX), with
Vitest tests and a light/dark theme.

## Setup

Requires Node 20.19+ or 22.12+ (the `engines` range declared by the locked
Vite release in `package-lock.json`).

```
npm install
```

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                     |
| `npm run build`   | Produce a production build (`vite build`)     |
| `npm run preview` | Serve the production build locally            |
| `npm test`        | Run the Vitest suite once (`vitest run`)      |

## Behaviour

### Actions

The page shows five buttons. Each one changes the displayed value:

| Button  | Effect                  |
| ------- | ----------------------- |
| `+`     | adds 1                  |
| `-`     | subtracts 1             |
| `reset` | sets the value to 0     |
| `+4`    | adds 4                  |
| `x2`    | doubles the value       |

The value starts at 0. There are no bounds: it can go above any number or
below zero.

### Click tally

The heading reads `Counter (N clicks)` and starts as `Counter (0 clicks)`.
Every recognized action increments N by one, including `reset`. The tally is
never reset.

### Tones

The displayed value is coloured by its size:

- above 10: high, red-toned
- below 0: low, blue-toned
- otherwise (0 through 10 inclusive): neutral

Exactly 10 and exactly 0 are neutral.

### Themes

A "Dark mode" toggle button switches between the light and dark themes. The
initial theme follows the operating system setting through the
`prefers-color-scheme` media query. The choice is not persisted: it lives in
memory only, so a reload returns to the system default.

## Project layout

```
index.html              page shell, loads src/main.jsx
vite.config.js          Vite and Vitest configuration
src/
  main.jsx              entry point, mounts <App />
  App.jsx               theme toggle plus counter
  Counter.jsx           buttons, value display and heading
  counterReducer.js     pure reducer, action names and tone rule
  theme.js              theme hook (prefers-color-scheme default)
  ThemeToggle.jsx       dark mode toggle button
  style.css             light/dark colour tokens and layout
  *.test.js(x)          tests, next to the sources they cover
  test/setup.js         shared test setup
```

## Architecture decisions

See [docs/adr/0002-react-rewrite.md](docs/adr/0002-react-rewrite.md) for the
decision to rewrite the app in React with Vite. It supersedes
[ADR 0001](docs/adr/0001-single-file-vs-build-step.md), which chose a
single-file page without a build step.
