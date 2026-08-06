
## Development notes

- All state (`c`, `cc`, `temp`) and behavior lives in the inline `<script>`
  block in `counter.html`.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.

### Regenerating counter.js

`counter.ts` is the source of truth for the counter widget's logic;
`counter.js` is generated from it by `tsc` (`module: "none"` + `outFile`,
see `tsconfig.json`). After editing `counter.ts`, regenerate it with:

```
npm install && npm run build
```

`counter.js` must be committed alongside `counter.ts` after regeneration —
it is not gitignored, so `counter.html` keeps working with zero install on
a fresh clone.

## Change log

Newest first. Append new entries in the same format.

### 2026-07-28

- Added `counter.test.html`, a static, no-build test page that loads the
  tsc-emitted `counter.js` and asserts all five `dispatch` action branches,
  the unrecognized-action and delegated-listener no-ops, the `#d` colour
  thresholds, and the `#ttl` text. See
  [docs/adr/0002-static-test-harness.md](docs/adr/0002-static-test-harness.md).
- Amended [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
  to record the `counter.ts`-source/`tsc`-emit flow and the decision to keep
  the emitted `counter.js` committed.
- `counter.ts` is now the typed source of truth for the counter widget's
  logic (previously `counter.js` directly).
- `counter.js` is now generated from `counter.ts` by `tsc` with
  `module: "none"` + `outFile`, emitting the same classic, global-scope
  script `counter.html` already loads via `<script src="counter.js">`.
- The emitted `counter.js` is committed to source control (not gitignored),
  preserving the zero-install "open `counter.html` directly" property.
