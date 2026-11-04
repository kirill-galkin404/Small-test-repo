# Counter app

Open `counter.html` in any modern browser; there is no build step, no server and
no install.

## Development notes

- All state (`c`, `cc`, `temp`), the click counter and every behavior live in the
  inline `<script>` block in `counter.html`, which is the only entry point.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.
