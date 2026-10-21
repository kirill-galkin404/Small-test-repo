# Counter

A small browser counter widget. This README describes the project as it exists in this repository.

> **REACT+:** this repository contains no REACT+ code (and no React code). The project is a static HTML/CSS/vanilla JavaScript page. `docs/adr/0001-single-file-vs-build-step.md` records the decision to stay without a build step, so moving to REACT+ would need a new ADR first.

## Stack

- Static HTML (`counter.html`, `index.html`)
- CSS (`style.css`)
- Vanilla JavaScript, loaded as a classic (non-module) script (`counter.js`)
- No build step, bundler, module system, `package.json` or external dependencies

## Setup

Nothing to install. Clone the repository and you are ready to go.

## Build and run

There is no build. Open `counter.html` in a web browser, either by double-clicking it or by opening its file path in the browser. Opening `index.html` works too: it redirects to `counter.html`.

## Project structure

| Path | Purpose |
| --- | --- |
| `counter.html` | The page: title, value display and the action buttons. |
| `counter.js` | All counter state and behaviour, wired through `data-action` attributes. |
| `style.css` | Styling for the value display and some buttons. |
| `index.html` | Redirects to `counter.html`. |
| `docs/adr/0001-single-file-vs-build-step.md` | Architecture decision to avoid a build step. |

## Counter behaviour

Each button sends an action to `dispatch` in `counter.js`. The value starts at 0 and no bounds are applied.

| Action | Button | Effect |
| --- | --- | --- |
| `INCREMENT` | `+` | Adds 1 |
| `DECREMENT` | `-` | Subtracts 1 |
| `RESET` | `reset` | Sets the value to 0 |
| `ADD_FOUR` | `+4` | Adds 4 |
| `DOUBLE` | `x2` | Doubles the value |

- **Click count:** every recognized action, including reset, adds one to the click count. Unrecognized actions are ignored and not counted. The `<h1>` heading shows it as `Counter (N clicks)` after the first action and reads `Counter` before that. The browser tab title does not change.
- **Colours:** the value is red above 10, blue below 0, and black otherwise.
- **Styling:** `style.css` styles only the value display and the `+`, `-` and `reset` buttons. The `+4` and `x2` buttons use the browser default look.
- **Reload:** state lives only in memory, so the value and click count reset when the page is reloaded.
