# 2. React + Vite + Vitest toolchain for the counter app rewrite

## Status: Accepted

This ADR supersedes ADR 0001 ([0001-single-file-vs-build-step.md](0001-single-file-vs-build-step.md)).

## Context

ADR 0001 decided to keep `counter.html` single-file, with no build step, no
bundler, and no `package.json`, on the grounds that the widget was too small
to justify a toolchain and that automated testing was not a current
requirement.

That has changed: the app is being re-platformed as a tested React SPA. The
business rules currently inlined in `counter.js` (arithmetic, dispatch
validation, color thresholds, entry redirect) need to be extracted into
pure, unit-testable modules, and the two views need to be rebuilt as React
components. None of this is achievable while keeping zero-dependency,
open-the-file-directly portability — React, a component model, and a test
runner all require a package manager and a build step.

## Decision

We will introduce a `package.json` and a Vite + React + Vitest toolchain,
superseding ADR 0001's Fork A ("stay single-file") decision.

- **Vite** provides the dev server and production build for the React SPA.
- **React** replaces the inline vanilla-JS DOM wiring with components.
- **Vitest** (plus `@testing-library/react` and `jsdom`) provides the unit
  and component test runner used to cover the four extracted business-rule
  modules and the rebuilt components.

Rationale: the goal of shipping automated test coverage over the app's
business rules, and of rebuilding the UI as React components, cannot be met
under ADR 0001's no-bundler, no-module-system constraint. The testability
and maintainability gains now outweigh the loss of single-file portability
that ADR 0001 weighed in the opposite direction.

## Consequences

- The repository gains a `package.json`, `vite.config.js`, and a `src/`
  layout; `counter.html`, `counter.js`, and `style.css` are retired once
  their React/Vite equivalents pass verification.
- Contributors need Node.js and `npm install` before they can run, build, or
  test the app — the "open the file directly" portability ADR 0001
  preserved is no longer available.
- Business rules move out of `counter.js` and into pure, DOM-free modules
  under `src/rules/`, each covered by Vitest unit tests.
