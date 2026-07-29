
## Development notes

- `counter.html` loads React, ReactDOM, and Babel standalone from a CDN via
  `<script src>` tags, and defines a single `Counter` function component
  inline in a `<script type="text/babel">` block (see
  [ADR-0001](docs/adr/0001-single-file-vs-build-step.md) for why this
  CDN-delivered-React exception is allowed and what it costs).
- All state (`c`, `cc`) lives in `Counter`'s `useReducer` state; there is no
  module-level mutable state and no separate `counter.js` file anymore.
- Each button still carries its original `data-action="..."` attribute, but
  it is now purely a CSS hook for `style.css`'s `button[data-action=...]`
  selectors — click behavior is wired through React `onClick` props instead
  of the old delegated `addEventListener`/`dataset.action` lookup.
- The reducer is the single place state changes happen; every recognized
  action returns new `{ c, cc }` state (incrementing the `cc` click
  counter), while an unrecognized action returns the state unchanged
  (a no-op, matching the old `dispatch`'s early return).

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.
