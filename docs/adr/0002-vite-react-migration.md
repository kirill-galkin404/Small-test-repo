# 2. Re-platform the counter onto a Vite + React build

## Status

Accepted

## Context

ADR 0001 accepted Fork A (stay single-file, no build step, no module
system) for `counter.html`. Since then, the need for automated regression
coverage of the counter's behaviour has grown: node `edf599cb` documents a
previously shipped defect where the `ADD_FOUR` button's visible label
(`+5`) did not match its actual `+4` numeric effect (fixed in PR #30). A
single-file, no-module, no-test-runner architecture has no way to guard
against this class of label/behaviour drift automatically.

We are re-platforming the counter onto:

- A build step ([Vite](https://vite.dev/)).
- ES modules (`app/src/*.js`/`*.jsx`, `"type": "module"` in
  `app/package.json`).
- [React](https://react.dev/), with state modeled as a single
  `useReducer(counterReducer, { c: 0, cc: 0 })` call in a `Counter`
  component, replacing the global `ACTION`/`dispatch`/`render()` functions
  and the delegated `data-action` click listener.

## Decision

We will pursue **Fork B: introduce a build step**, using Vite, ES modules,
and React, for the counter widget. The Vite project lives under `app/`.

This decision explicitly supersedes ADR 0001's Fork A decision.

## Behaviour contract preserved across the migration

The migration is required to preserve, exactly:

- The five actions: `INCREMENT` (+1), `DECREMENT` (-1), `RESET` (to 0),
  `ADD_FOUR` (+4), `DOUBLE` (x2), each incrementing the click counter
  (`cc`) by one.
- An unrecognized action never increments `cc` and leaves state unchanged.
- Display colour thresholds: red when `c > 10`, blue when `c < 0`, black
  otherwise.
- Title text of exactly `Counter (N clicks)`, where `N` is `cc`.

`app/src/counterReducer.js` is unit-tested against all five actions and the
unmatched-action no-op; `app/src/Counter.jsx` has a render test asserting
the colour thresholds and title text against click sequences, closing the
label/behaviour drift gap that ADR 0001's architecture could not guard
against.

## Consequences

- The counter widget now requires `npm install` and a build step
  (`app/package.json`, Vite) instead of being directly openable as a
  static file; portability trades off against testability and
  maintainability, per ADR 0001's own anticipated revisit condition.
- `ACTION` and the reducer's dispatch function are local to `app/src`
  modules; neither is attached to `window` or `globalThis`.
- No state-management library (Redux, Context API, or similar) was
  introduced — a single component with five actions has no cross-component
  sharing need that would justify one.
- `index.html`, `counter.html`, `counter.js`, and `style.css` at the
  repository root have been deleted; `app/index.html` is the sole HTML
  entry point, and `app/dist/` (produced by `npm run build`) is the
  promoted build output.
