# 2. Adopt React and a Vite build step

## Status

Accepted. This ADR supersedes ADR 0001
([single-file vs. build-step](0001-single-file-vs-build-step.md)).

## Context

ADR 0001 chose Fork A: keep the counter as a single file with no build step,
no module system, and no `package.json`. At that time the counter was a small
self-contained page with no automated tests and no requirement for any.

That requirement has changed. The goal is now to port the counter app to React,
document it in a README, and cover it with automated tests. ADR 0001 itself
said that growing testability needs would be a reason to revisit the decision,
and that the revisit must produce a new ADR rather than an ad-hoc change. This
is that ADR.

## Decision

We adopt **React 18 with a Vite multi-page build** and supersede ADR 0001's
Fork A decision.

- **Build:** Vite multi-page build. `index.html` stays a static redirect.
  `counter.html` is the app page and mounts `src/main.jsx`.
- **Testing:** Vitest with React Testing Library.
- **State logic:** a pure reducer in `src/counterReducer.js`.
- **Event wiring:** a per-button `onClick` replaces the delegated
  `addEventListener` on `#counter`.
- **State:** in-memory only; nothing is persisted.
- **Styling:** `style.css` is reused unchanged.
- **Logging:** the per-action `console.log` is dropped; the warning for an
  unknown action is kept.
- **Heading:** shows `Counter` until the first click, then
  `Counter (N clicks)`.

## Consequences

- The project gains a toolchain dependency: Node, npm, and a `package.json`.
- `npm install` and a build (`npm run build`) are required to produce a
  deployable page; `counter.html` can no longer be opened directly from the
  file system in a browser.
- The zero-dependency, single-file portability promised by ADR 0001 is lost.
- Testability improves: the reducer is unit-testable in isolation and the
  components are testable with React Testing Library under Vitest.
- Any future decision to drop the build step or change this architecture must
  itself produce a new ADR.
