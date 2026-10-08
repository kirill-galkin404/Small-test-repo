# 2. Rewrite the counter as a Vite + React app

## Status

Accepted

Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose Fork A: keep the counter as a zero-build widget made of
`counter.html`, `counter.js` and `style.css`, with no bundler, no module
system and no `package.json`, so it could be opened directly via `file://`.
That decision explicitly said that growing testability needs would be a reason
to revisit it with a new ADR. This is that ADR.

The zero-build design left the behaviour untestable in isolation (global
`ACTION`/`dispatch`, DOM-coupled rendering), and the widget now needs a
light/dark theme, which is awkward to do and verify without a component model
and automated tests.

## Decision

We will rewrite the counter as a **Vite + React 18** application, taking
ADR 0001's Fork B.

- State is managed with `useReducer` and a pure reducer in
  `src/counterReducer.js`, which can be unit-tested without a DOM.
- Tests use Vitest, React Testing Library and jsdom.
- Theming uses CSS variables for light and dark palettes. The initial theme
  follows `prefers-color-scheme`, and a toggle lets the user override it; the
  chosen theme is persisted in `localStorage`.
- The counter value and click count remain in memory only. The theme choice is
  the only persisted state.
- The built output uses a relative base (`./`), so it can be hosted from a
  subpath.

## Alternatives considered

- **Keep the zero-build widget (ADR 0001, Fork A).** Preserves `file://`
  portability and has no toolchain, but leaves the logic untestable and makes
  the theming work harder to build and verify. Rejected.
- **Other frameworks (Vue, Svelte, Preact, etc.) or vanilla ES modules with a
  bundler.** Viable, but React offers the most familiar component and testing
  ecosystem for this project. Rejected.
- **TypeScript.** Would add type safety but also configuration and tooling
  weight that a widget this small does not need. Rejected for now; it can be
  adopted later by its own decision.

## Consequences

- Node and npm are required to develop, test and build the app.
- There is now a build step. The built output should be served over http;
  opening files directly from `file://` is no longer supported, although the
  relative base (`./`) allows hosting from a subpath.
- Automated tests are now possible and are part of the project.
- Intentional behaviour changes relative to the old widget:
  - The reducer checks actions using an own-property check.
  - Values are rendered as `textContent` (React text nodes), not through
    HTML strings.
  - The title is pluralised from the first render (e.g. `1 click`).
  - `document.title` mirrors the heading.
  - No globals are exposed and nothing is logged to the console.
  - There is no index redirect to `counter.html`.
- ADR 0001 remains as historical record; only its status changed.
