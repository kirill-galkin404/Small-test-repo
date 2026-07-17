
## Running it

No installation or build is required. Open `counter.html` directly in a
browser:

```
open counter.html      # macOS
xdg-open counter.html  # Linux
```

or serve the directory with any static file server and navigate to
`counter.html`.

## Development notes

- All state (`c`, `cc`, `temp`) and behavior lives in the inline `<script>`
  block in `counter.html`.
- Button click handling is wired via inline `onclick="doOperation(ACTION.X)"`
  attributes on each button — there is no `addEventListener`/`data-action`
  wiring today.
- `doOperation(x)` is the current single entry point for mutating state; it
  switches on the frozen `ACTION` enum, and every action case falls through
  to a shared tail that increments `cc` and calls `render()`.
- `ACTION` and `doOperation` are deliberately kept in global scope: the
  inline `<script>` block is a classic, non-module script, and the
  `onclick` attributes need `ACTION` to be reachable globally.
- Planned migration: move click handling to `addEventListener` keyed off a
  `data-action` attribute on each button, with a renamed `dispatch(x)`
  replacing `doOperation` as the single entry point. This is a future
  target, not the current implementation.
