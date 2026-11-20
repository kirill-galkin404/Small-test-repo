# 2. Adopt React with a Vite build step

## Status

Accepted. Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose Fork A (stay single-file: no build step, no module system, no
`package.json`) and stated that revisiting the decision, for example to adopt
Fork B (a build step), must produce a new ADR rather than an ad-hoc change.
This is that ADR.

The counter app now needs a component structure and a real module system.
Keeping the logic in global scope behind a classic inline script no longer
suits that goal.

## Decision

- Rewrite the app in **React**, with the counter logic expressed as components
  and a reducer instead of a global `dispatch` and manual DOM updates.
- Use **Vite** as the dev server and bundler.
- Introduce a `package.json` (and a committed `package-lock.json`) with
  scripts such as `dev`, `build` and `preview`. `.gitignore` excludes
  `node_modules` and `dist`, which are never committed.
- Behaviour stays identical to the single-file version:
  - the actions are INCREMENT, DECREMENT, RESET, ADD_FOUR and DOUBLE;
  - the title is `Counter` until the first recognised click, then
    `Counter (N clicks)`;
  - the value is red above 10, blue below 0 and black otherwise;
  - an unknown action logs a `console.warn` and changes no state.

## Consequences

- A Node.js toolchain and an install step (`npm install`) are now required to
  develop and build the app. The zero-dependency, copy-anywhere portability
  described in ADR 0001 is given up.
- Opening the built page directly via `file://` no longer works reliably,
  because browsers block module scripts loaded from `file://`. Use
  `npm run dev` or `npm run preview` instead.
- The `console.log` tracing in the old script is dropped. Only the
  `console.warn` for unknown actions is kept.
- Modules and components can be unit-tested in isolation, and dependencies
  are explicit imports.
- ADR 0001 is marked `Superseded by 0002`. Its body is otherwise unchanged.
