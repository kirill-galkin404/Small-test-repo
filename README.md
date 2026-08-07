
## Development notes

- All state (`c`, `cc`) and behavior is authored in `counter.ts` and
  compiled with `tsc` to `counter.js`, which `counter.html` loads via an
  external, classic (non-module) `<script src="counter.js">` tag.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no `onclick`
  attributes on the buttons themselves.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.

## Change log

- 2026-08-10 — Re-platformed `counter.js` to strict-mode `counter.ts`,
  compiled in place to `counter.js` by a `tsc`-only build step (no
  bundler, no ES modules, no `"module": "none"`). Added a Vitest+jsdom
  behaviour-lock test suite that was greened against the original
  `counter.js` before the port, then used unchanged as the acceptance
  gate for the TypeScript port. Amended
  [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
  to record the new build step without reopening the Fork A decision,
  and corrected this README's Development notes, which had gone stale.
