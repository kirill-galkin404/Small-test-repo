
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

## Running the tests

Open `tests/counter.test.html` in a browser. It loads `counter.js` against a
copy of the `#counter` markup, clicks each button (including `-`) and checks the
results. When every assertion passes, the page's `<body>` gets
`data-result="pass"` (otherwise `data-result="fail"`), and a log is shown on the
page. No tooling is needed — no build step, no `package.json`, no test runner —
which is consistent with the single-file approach in the ADR above. For a
headless run (the dumped page also contains the script source, so match the
`<body>` tag only):
`chromium --headless --dump-dom file://$PWD/tests/counter.test.html | grep '<body data-result'`.
