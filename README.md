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
- Button click handling uses `addEventListener`, keyed off each button's
  `data-action` attribute — there are no inline `onclick` handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.
