
## Development notes

- All state and behavior lives in external `counter.js`, loaded via
  `<script src="counter.js"></script>` in `counter.html` — there is no inline
  `<script>` block.
- State is a single `state` object with two fields: `state.value` (the
  counter's value) and `state.clicks` (count of dispatched actions, shown as
  clicks in the title).
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state. It guards
  against unrecognized actions up front (warns and returns before the
  `switch`); every recognized action case falls through to a shared tail that
  increments `state.clicks` and calls `render()`.
- `render()` doesn't set inline colour styles. Instead it toggles the
  `is-overflow` and `is-negative` classes on `#d` based on `state.value`;
  `style.css` owns the actual colours for those classes. `is-overflow` /
  `is-negative` is a naming contract shared between `counter.js` and
  `style.css` — renaming one side without the other silently falls back to
  black.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.
