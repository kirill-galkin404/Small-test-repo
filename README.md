
## Development notes

- All state (`c`, `cc`, `temp`) and behavior lives in the inline `<script>`
  block in `counter.html`.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

### Diagnostics

The click→dispatch→render path fails loudly instead of silently:

- The delegated click listener throws an `Error` naming the offending
  element and attribute (e.g. `Counter: trigger element has no usable
  data-action (<button class="…">)`) if it sees a configured trigger
  element (matched by `[data-action]`) whose `data-action` is blank. It
  still silently ignores clicks on genuine non-trigger children
  of `#counter`, such as `#ttl` and `#d`.
- `dispatch(x)` throws an `Error` naming the offending code (e.g.
  `dispatch(): unknown ACTION code 999 — check the ACTION table against
  the data-action attributes in counter.html`) instead of
  `console.warn`-and-return for an `x` that doesn't match any `ACTION`
  value.
- On script load, a startup check iterates every `[data-action]` element
  under `#counter` and reports any value that isn't a key in `ACTION` as a
  single `console.error` listing all mismatches at once, before any click
  occurs.

These errors are thrown from inside `counter.js`, loaded via
`<script src>`; when the page is opened directly as a `file://` URL, some
browsers mute the message on a page-level `window.onerror`/`error` listener
for that case (reported as generic "Script error."), but the real message
and stack are always visible in the DevTools console.

No build step, bundler, or module system was introduced to add these
diagnostics — `ACTION` and `dispatch` remain global, plain-script
identifiers per
[docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md).
A manual-but-repeatable assertion suite covering these diagnostics (and the
five actions and colour thresholds) lives in `counter.test.html`; see
[docs/adr/0002-static-test-harness-page.md](docs/adr/0002-static-test-harness-page.md)
for why that second page exists and [docs/manual-test-script.md](docs/manual-test-script.md)
for how to run it.

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes.
