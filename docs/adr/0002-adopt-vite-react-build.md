# 2. Adopt a Vite, React and Vitest build for the counter widget

## Status

Accepted

Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose to keep the counter widget as a single, dependency-free
`counter.html` (plus `counter.js` and `style.css`) with no build step, no
module system and no `package.json`. It also stated that revisiting that
decision to introduce a build step must produce a new ADR rather than an
ad-hoc change. This is that ADR.

The widget is being rewritten in React and needs a light/dark theme and
automated tests (including a WCAG AA contrast check). Those needs outweigh
the zero-dependency portability that motivated ADR 0001:

- Component and unit tests need ES modules and a test runner.
- A React component model needs a JSX toolchain.
- Theming through CSS custom properties is easier to verify with tests when
  the styles and tokens are part of a module graph.

## Decision

We adopt **Fork B** from ADR 0001: introduce a build step.

- **Vite** is the dev server and bundler, and **React** is the UI library.
  The project gets a `package.json` and an `index.html` entry point.
- **Vitest** with **React Testing Library** is the test suite.
- The light/dark theme uses CSS custom properties. The toggle defaults to
  the user's `prefers-color-scheme`.
- The state is not persisted, and the project does not use TypeScript.
- The legacy files `counter.html`, `counter.js` and `style.css` are removed
  by the rewrite.

## Consequences

- A build step is now required. Opening `index.html` directly from the file
  system no longer works. Use `npm run dev` for development, `npm run preview`
  to inspect a production build, or serve the built `dist/` directory from a
  static host.
- Contributors need Node.js and `npm install` before working on the widget.
- Dependencies are explicit imports, and logic and components can be tested
  in isolation with `npm test`.
- ADR 0001's constraints (no bundler, no module system, no `package.json`)
  no longer apply. ADR 0001 is kept as historical record, with its status
  set to Superseded.
