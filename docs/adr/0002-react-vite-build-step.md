# 2. React + Vite build step for the counter app

## Status

Accepted. Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose Fork A (stay single-file, no build step, no `package.json`)
and said that revisiting the decision should produce a new ADR. The counter
is being rebuilt in React, with behaviour pinned by automated tests, which
needs a toolchain and a `package.json`.

ADR 0001's description of the code was also inaccurate in places. The actual
code is:

- an external `counter.js` loaded by the page, not an "inline" script block;
- state consisting only of `c` and `cc` (there is no `temp` state variable);
- a `dispatch` `switch` in which each case ends with `break`, and unknown
  actions return early, before `cc++` and `render()`. Cases do not "fall
  through to a shared tail".

## Decision

We choose **Fork B: introduce a build step**: React, Vite, ES modules and a
`package.json`, with tests run by Vitest.

- `index.html` becomes the Vite entry point (`base: './'`). The meta refresh
  redirect is removed and the page gains a `#root` element and a module script.
- `counter.html` is kept as a redirect to `index.html`, placed in `public/`
  so that existing links keep working.
- Behaviour was pinned first by a black-box DOM suite written against the
  legacy page; its mount helper was then repointed at the React component.
  The suite now runs against the React implementation only.
- The `console.log`/`console.warn` tracing in the legacy `dispatch` is
  intentionally dropped in the React reducer.

## Consequences

- The "open the file directly" portability is lost. Vite's ES-module build
  does not work from `file://`, so the app must be served, for example with
  `npm run preview`.
- Contributors need Node and `npm install`; dependencies are explicit
  imports and modules can be unit-tested in isolation.
- ADR 0001's constraints (no bundler, no modules, no `package.json`) no
  longer apply. ADR 0001 is kept unchanged as a historical record, apart
  from its Status line.
