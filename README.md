
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

### Building `counter.js` from `counter.ts`

`counter.js` is compiled from `counter.ts` with a pinned, module-free `tsc`
invocation:

```
tsc -p tsconfig.json
```

This requires only a locally- or globally-installed TypeScript compiler
(`tsc`) — there is no `package.json`, no `npx`-triggered network fetch, and
no other runtime dependency introduced.

`counter.ts` and its compiled `counter.js` must always be committed together
in the same change. A commit that changes `counter.ts` without a matching
`counter.js` change (or vice versa) is incomplete and should be treated as
such by CI/reviewers — it would mean the shipped, browser-executed
`counter.js` no longer matches its typed source.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
and [docs/adr/0002-typescript-compile-step.md](docs/adr/0002-typescript-compile-step.md)
for the architectural decisions behind this, before making any structural
changes.
