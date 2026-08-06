
## Development notes

- `counter.ts` is the source of truth for `counter.js`. `counter.js` is
  generated, compiled output — it is checked in (so `counter.html` can keep
  loading it directly with no build step at page-load time) but it is not
  hand-edited. To regenerate it after changing `counter.ts`, run:

  ```
  tsc -p tsconfig.json
  ```
- All state (`c`, `cc`) and behavior lives in `counter.ts`/`counter.js`,
  loaded by `counter.html` via a classic `<script src="counter.js">` tag.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.

## Change log

- 2026-08-06: `counter.js` is now generated output, compiled from a new
  `counter.ts` source via `tsc` (`"module": "none"` + `"outFile"`).
  `counter.html` is unchanged and still loads it via the existing classic
  `<script src="counter.js">` tag. No bundler, `package.json`, or ES module
  loader was introduced — ADR 0001 / Fork A remains intact.
