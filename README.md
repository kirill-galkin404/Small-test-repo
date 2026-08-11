
## Development notes

- All state (`c`, `cc`) and behavior lives in `counter.js`, an external
  script loaded by `counter.html` (`<script src="counter.js">`).
- `counter.js` is a **generated artifact**: its authoritative source is
  `counter.ts`. Do not hand-edit `counter.js` — edit `counter.ts` and
  regenerate with `tsc -p tsconfig.json`.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.
