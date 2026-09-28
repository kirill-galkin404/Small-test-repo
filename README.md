
## Development notes

See [RULES.md](RULES.md) for the full business-rules reference.

- All state (`c`, `cc`) and behavior lives in `counter.js`, loaded via
  `<script src="counter.js"></script>` in `counter.html`.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no per-button
  `onclick` handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.
- The `#theme-toggle` button has its own separate `addEventListener` call in
  `counter.js`, independent of the delegated `#counter` listener above. It
  is presentation-only: it toggles `data-theme` on `<html>` and persists the
  choice to `localStorage`, but never calls `dispatch()` and never changes
  `c` or `cc`.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.
