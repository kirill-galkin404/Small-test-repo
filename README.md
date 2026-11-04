# Counter app

A small browser counter. Open `index.html` (it redirects to `counter.html`) or
`counter.html` directly in a browser. There is no build step and no server, and
nothing to install.

## Files

- `index.html` — redirects to `counter.html`.
- `counter.html` — the page: title, value display and five `data-action` buttons.
  It loads `counter.js` and `style.css`.
- `counter.js` — all behavior (state, `dispatch`, `render`).
- `style.css` — styling for the value display and some of the buttons.
- `tests/counter.test.js` — tests for `counter.js`.

## Usage

Click a button to change the counter. It starts at 0, has no upper or lower
bound, and can go negative.

| Action      | Button  | Effect       |
| ----------- | ------- | ------------ |
| `INCREMENT` | `+`     | adds 1       |
| `DECREMENT` | `-`     | subtracts 1  |
| `RESET`     | `reset` | sets it to 0 |
| `ADD_FOUR`  | `+4`    | adds 4       |
| `DOUBLE`    | `x2`    | multiplies by 2 |

Any other action is ignored and logs a console warning.

The value is red above 10, blue below 0, and black otherwise.

## State

State lives in two globals in `counter.js`. It is held in memory only and is not
persisted, so it resets on page reload.

- `c` — the current value.
- `cc` — the number of recognized actions so far. It counts every recognized
  action, including `RESET`, and `RESET` does not clear it. It is shown in the
  title as `Counter (N clicks)`.

## How it works

A single click listener on `#counter` handles all buttons (click delegation).
Each button carries a `data-action` attribute, and the handler finds the button
with `event.target.closest('[data-action]')` and passes the matching action to
`dispatch`. `dispatch` updates `c`, increments `cc` for recognized actions, and
calls `render`, which updates the value, its colour and the title.

## Styling note

The `+4` (`ADD_FOUR`) and `x2` (`DOUBLE`) buttons currently have no rules in
`style.css`, so they use the browser's default button look.

## Tests

```
node tests/counter.test.js
```

This needs Node only; there is nothing to install.

## Architecture

See [docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
before making structural changes. Per ADR 0001 (Fork A), no build step, module
system or `package.json` is introduced.
