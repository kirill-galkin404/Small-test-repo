# Small-test-repo

Single-file HTML/JS counter widget (`counter.html`). No build step, no dependencies.

## Usage

Open `counter.html` in a browser.

## How it works

The 5 buttons (`+`, `-`, `reset`, `+5`, `x2`) use `data-action` attributes wired
up on `DOMContentLoaded` (no inline `onclick`). Each click calls
`dispatch(ACTION.X)`, which updates the count (`c`), increments the click
count (`cc`), and calls `render()` to update the DOM.

## State

- `c` — current count, shown in `#d`.
- `cc` — number of valid dispatches, shown in the title (`#ttl`) as
  `Counter (N clicks)`.
