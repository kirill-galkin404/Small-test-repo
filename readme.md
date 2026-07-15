# Small-test-repo

A small, single-file sandbox used for practicing incremental refactors on a
plain HTML/JS counter widget. There is no build step and no package manager —
everything lives in `counter.html`.

## Project contents

- `counter.html` — a self-contained page (markup + inline `<script>`) that
  renders a click counter with five actions:
  - **+** increments the count
  - **-** decrements the count
  - **reset** resets the count to zero
  - **+5** adds five to the count
  - **x2** doubles the count

  Each button is wired up via `data-action` attributes and a single
  `DOMContentLoaded` listener that dispatches the corresponding `ACTION` to
  the `dispatch(x)` function. `dispatch` mutates the shared `c` (count) and
  `cc` (click count) state and then calls `render()` to update the DOM
  (`#d` for the count, `#ttl` for the title with the click count).

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
