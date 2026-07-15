# Small-test-repo

Single-file HTML/JS counter widget (`counter.html`) for practicing refactors.
No build step, no dependencies.

## Usage

Open `counter.html` in a browser. No server or build step is required —
double-clicking the file (or serving it statically) is enough.

## How it works

The 5 buttons (`+`, `-`, `reset`, `+5`, `x2`) are wired via `data-action`
attributes to `dispatch(ACTION.X)`, which updates `c` (count) and `cc`
(click count), then calls `render()` to update the DOM.

Event wiring happens once, on `DOMContentLoaded`: every element with a
`data-action` attribute is queried and given a `click` listener that maps
its attribute value to the matching `ACTION` constant and calls
`dispatch(...)`. There are no inline `onclick` attributes in the markup.

## Actions

| Button   | `data-action` | `ACTION` constant | Effect on `c`        |
|----------|----------------|-------------------|-----------------------|
| `+`      | `INCREMENT`    | `ACTION.INCREMENT`| `c = c + 1`           |
| `-`      | `DECREMENT`    | `ACTION.DECREMENT`| `c = c - 1`           |
| `reset`  | `RESET`        | `ACTION.RESET`    | `c = 0`               |
| `+5`     | `ADD_FOUR`     | `ACTION.ADD_FOUR` | `c = c + 4`           |
| `x2`     | `DOUBLE`       | `ACTION.DOUBLE`   | `c = c * 2`           |

Every recognized action shares a common tail in `dispatch`: it increments
`cc` once and calls `render()`. An unrecognized action code hits the
`default` case, logs a warning, and returns early — `cc` is not
incremented and `render()` is not called.

## State variables

- `c` — the current count, shown in `#d`. It is the sole numeric
  authority for the display; the DOM is render-only and never mutated
  directly from a handler.
- `cc` — a running total of every successfully dispatched action
  (i.e. every click that matched a known `ACTION`), shown in the page
  title (`#ttl`) as `Counter (N clicks)`. It increments once per valid
  dispatch, not once per `render()` call.
- `temp` — scratch variable used only inside the `ADD_FOUR` case.

## Rendering

`render()` is the single place that writes to the DOM:
- Sets `#d`'s text to `c`.
- Colors `#d` red when `c > 10`, blue when `c < 0`, and black otherwise.
- Sets `#ttl`'s text to `Counter (` + `cc` + ` clicks)`.

## File structure

```
counter.html   the entire app: markup, inline CSS, inline <script>
README.md      this file
```

There is intentionally no build tooling, package manifest, or test
runner — the file is meant to be read and refactored directly.

## History

`counter.html` started as an intentionally messy counter and has been
incrementally cleaned up: dead code removal, named `ACTION` constants,
making `c` the sole numeric authority, consolidating the click-count
increment into the dispatcher, decoupling the buttons from inline
`onclick` handlers in favor of `data-action` + `addEventListener`, and
renaming the dispatcher from `doStuff` to `dispatch`. Each step is a
small, self-contained commit intended as a refactoring exercise.

## Tech

Plain HTML5, vanilla JS, inline CSS — no frameworks, build tools, or
dependencies.
