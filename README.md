
## Development notes

- All state and behavior lives in the externally-loaded `counter.js`, referenced
  from `counter.html` via `<script src="counter.js">`; styling lives in
  `style.css`, referenced via `<link rel="stylesheet" href="style.css">`.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; it looks up a
  transformer function for `x` in the `TRANSFORMERS` map keyed by `ACTION`.
  On a match it updates `state.value`, increments `state.dispatchCount`
  exactly once, and calls `render(state)`; on no match it returns early with
  no state change and no render.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.
