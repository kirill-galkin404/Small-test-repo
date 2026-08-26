
## Development notes

- All state (`c`, `cc`) and behavior is authored in `counter.ts` and compiled
  to `counter.js`, which `counter.html` loads via a plain
  `<script src="counter.js">` tag.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

See [docs/adr/0002-typescript-build-step.md](docs/adr/0002-typescript-build-step.md)
for the architectural decision to compile `counter.ts` to `counter.js` via a
minimal `tsc` build step, which supersedes the single-file, no-build-step
decision in
[docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md),
before making any structural changes.
