# 2. Adopt a Vite + React build step for the counter app

## Status

Accepted. Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose to keep the counter as a single, no-build, classic-script
page (`counter.html`, `counter.js`, `style.css`, with an `index.html`
redirect), and said that revisiting that choice must produce a new ADR
rather than an ad-hoc change. This is that ADR.

The counter app is being rewritten as a React application. That requires a
JSX transform and module loading, which in turn requires a build step and a
`package.json`, both of which ADR 0001 ruled out.

## Decision

We will adopt **Vite with React and plain JavaScript (JSX)**, with
`index.html` at the repository root as the Vite entry point. This supersedes
ADR 0001 and replaces its Fork A decision with Fork B.

Counter behavior and styles are unchanged by the rewrite.

### Alternatives rejected

- **Stay single-file (ADR 0001, Fork A):** incompatible with React/JSX and
  ES modules; the portability it protected is no longer a requirement.
- **TypeScript:** not needed for a widget this small; plain JS (JSX) keeps
  the toolchain minimal.
- **Other frameworks or bundlers (e.g. Vue, Svelte, esbuild alone):** React
  was the requested target, and Vite gives it with minimal configuration.
- **Router or persistence:** out of scope; the app is a single view whose
  state need not survive a reload.

## Consequences

- A Node toolchain is required to develop and build (Node ^22.13 or >= 24).
- The built `dist/` output must be served over HTTP. `file://` is not
  supported, so the "open the file directly in a browser" portability from
  ADR 0001 is lost.
- If the app is hosted on a subpath, Vite's `base` option may need to be
  set.
- `/counter.html` will 404 after the rewrite: `index.html` serves the app
  directly and there is no redirect.
- Counter behavior and styles are unchanged.
- The `console.log` traces from the old script are dropped.
- Details of the reducer (pure, and whether it is silent or warns on an
  unrecognized action) are left to the implementation.
- Modules and components can now be unit-tested in isolation, and
  dependencies are explicit imports.
