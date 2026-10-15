# 2. Adopt Vite and React for the counter app

## Status

Accepted

Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

[ADR 0001](0001-single-file-vs-build-step.md) chose Fork A (stay single-file):
`counter.html` and `counter.js` with no build step, no module system, and no
`package.json`. That ADR also required that any reversal be recorded in a
new ADR rather than made ad hoc, and named growing testability needs as the
reason to revisit the decision.

That need has arrived. The counter's state-change logic (`ACTION`/`dispatch`,
the shared click-count tail, tone and heading rules) lives in globals wired to
the DOM, so it cannot be unit-tested in isolation. We want parity tests that
pin the existing behavior and a structure in which the state logic is a pure
module.

This ADR records the choice of **Fork B (introduce a build step)** from
ADR 0001.

## Decision

Decision D-0005: adopt Fork B and rewrite the counter as a Vite + React app.

- **Stack:** Vite and React 18, in plain JS/JSX. Tests use Vitest and React
  Testing Library. There is no TypeScript and no CI configuration.
- **Structure:** a pure reducer module holds the state logic and a React
  component renders it. The component keeps the same visible behavior as the
  legacy page.
- **Entry point:** `index.html` becomes the Vite entry. `counter.html` is
  deleted with no redirect stub. External bookmarks to `counter.html` cannot
  be inspected and are unchecked, so they may break. This risk is accepted
  and recorded here.
- **Logging:** the legacy per-dispatch `console.log`/`console.warn` output is
  dropped. The one exception is a `console.warn` for unknown actions.
- **Theme:** the app uses a dark theme with no toggle.
- **Legacy removal:** the legacy files are deleted only after the parity
  tests pass.

Constraint C-0006: legacy files are deleted only after the parity tests pass.
A new ADR must precede any reversal of ADR 0001, and this ADR is that record.

## Consequences

- The "open the file directly" portability of ADR 0001 is lost. Running the
  app now needs an install step and a dev server or a build (`npm install`,
  then `npm run dev` or `npm run build`).
- The repository gains a `package.json`, a Node toolchain and a dependency
  tree to maintain.
- The state logic can be unit-tested in isolation and checked against the
  legacy behavior through parity cases.
- Anyone using a bookmark or link to `counter.html` gets a 404 with no
  redirect, and we cannot tell whether such links exist.
- Console output is quieter than before. Anything that relied on the
  per-dispatch logs, other than the unknown-action warning, no longer gets
  it.
- Users cannot switch between light and dark themes.
- Reverting to a single-file design would need a further ADR.
