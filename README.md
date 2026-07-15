# Small-test-repo

A single-file HTML/JS counter widget used for practicing refactors. No build
step — everything lives in `counter.html`.

## Usage

Open `counter.html` directly in a browser (or serve the directory statically).

## How it works

Five buttons (`+`, `-`, `reset`, `+5`, `x2`) are wired via `data-action`
attributes and a `DOMContentLoaded` listener that calls `dispatch(ACTION.X)`.
`dispatch` mutates the shared `c` (count) and `cc` (click count) state, then
calls `render()` to update `#d` (count) and `#ttl` (title with click count).
