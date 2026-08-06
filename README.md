
## Development notes

- All state (`c`, `cc`) and behavior live in `src/counter.ts`, which is
  compiled by `tsc` into `counter.js`. `counter.html` loads the compiled
  output via `<script src="counter.js">` — there is no inline `<script>`
  block and no `temp` variable.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.
- To rebuild `counter.js` after editing `src/counter.ts`, run `npm install`
  once, then `npm run build` (or `npm run watch` during development).

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, and its amendment covering the `tsc`-only
compile-step exception, before making any structural changes.

## Changelog

### 2026-08-06 — Re-platform to type-checked TypeScript

- Counter widget logic moved to `src/counter.ts`, authored under strict
  TypeScript (`strict`, `noImplicitAny`).
- Added a `tsc`-only compile step: root-level `package.json` (with
  `typescript` as the only devDependency) and `tsconfig.json` (`target`
  `ES2017`, `module: "none"`, `rootDir: "src"`, `outDir: "."`). No bundler,
  no module system, no dev server.
- Established a source/output split: `src/counter.ts` is the source of
  truth; `tsc` emits the compiled, dependency-free classic script to
  `counter.js` at the repo root, the same path `counter.html` already
  referenced. The compiled `counter.js` is committed to git (with a
  `GENERATED FILE` header) so opening `counter.html` directly still works
  with no install step.
- Amended `docs/adr/0001-single-file-vs-build-step.md` to record this
  authoring-time exception to Fork A (single-file, no build step).
