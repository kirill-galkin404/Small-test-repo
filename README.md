# Small-test-repo

Single-file HTML/JS counter widget (`counter.html`) for practicing refactors.
No build step, no dependencies.

## Usage

Open `counter.html` in a browser.

## How it works

The 5 buttons (`+`, `-`, `reset`, `+5`, `x2`) are wired via `data-action`
attributes to `dispatch(ACTION.X)`, which updates `c` (count) and `cc`
(click count), then calls `render()` to update the DOM.

## Tech

Plain HTML5, vanilla JS, inline CSS — no frameworks, build tools, or
dependencies.
