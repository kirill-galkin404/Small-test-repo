# 2. Rewrite the counter app in React (Vite) with tests

## Status

Accepted. Supersedes [ADR 0001](0001-single-file-vs-build-step.md).

## Context

ADR 0001 chose to keep the counter as a single file with no build step, no
module system and no `package.json`. That decision itself said that a revisit
should produce a new ADR rather than an ad-hoc change; this is that ADR. Once
it is accepted, ADR 0001 will be marked Superseded by 0002 (done in a later
step, not in this draft).

The counter is being rewritten as a React app built with Vite, in plain
JS/JSX (no TypeScript), with Vitest tests and a dark theme. The legacy
`counter.html`, `counter.js` and `style.css` have been removed. This ADR
records the architecture and, below, a decision for each quirk of the legacy
behaviour.

## Decision

Use React with Vite as the build tool, plain JavaScript/JSX (no TypeScript),
and Vitest for tests.

- **Reducer.** State is held with `useReducer`. The legacy `dispatch` switch
  becomes the pure `counterReducer` in `src/counterReducer.js`, with the
  `ACTION` constants and a pure `toneFor(value)` helper that maps the value to
  `high`, `low` or `neutral`. Both are tested in isolation.
- **Buttons.** Each button keeps its `data-action` attribute (for example
  `data-action="INCREMENT"`) and dispatches that action on click.
- **Theme tokens.** Colours are CSS custom properties in `src/style.css`:
  the light palette on `:root` and the dark palette on
  `:root[data-theme="dark"]`. A `ThemeToggle` button sets the `data-theme`
  attribute on the document element. It defaults from
  `prefers-color-scheme` and is deliberately not persisted, so a reload
  returns to the OS preference. The light palette is deliberately darkened
  from the legacy colours so text meets 4.5:1 contrast; a test checks the
  ratios.
- **Portability.** The legacy single-file "open the file directly" workflow
  is gone. Running the app now needs `npm install` and either the Vite dev
  server or the built `dist/` served over HTTP.

## Quirk decisions

### Initial render — change

Legacy shows just `Counter` until the first action, because the first
`render()` only happens after a click. The React version renders the initial
render as `Counter (0 clicks)`. Reason: the title should reflect state from
the start, and React renders from state on mount anyway, so keeping the quirk
would need extra code for no benefit.

### Unstyled +4 and x2 buttons — change

Legacy `style.css` has no rules for the `ADD_FOUR` and `DOUBLE` actions, so
the +4 and x2 buttons look different from the rest. The React version styles
them like the other buttons. Reason: the missing rules are an omission, not
a design intent.

### Unknown-action no-op — keep

An unrecognized action leaves state unchanged and does not count as a click.
The React reducer returns the same state object. The legacy `console.warn`
is dropped (see console logging). Reason: it is a safe default, and
returning the same state also avoids a re-render.

### Tally rules — keep

- The click tally counts every recognized action and is never reset.
- Tone thresholds: red/high when the value is above 10, blue/low when it is
  below 0, otherwise neutral.
- There are no bounds on the value.

Reason: these are the app's observable behaviour; the rewrite should not
change them.

### Console logging — drop

Legacy `dispatch` logs with `console.log` and `console.warn`. The React
version logs nothing. The loss of the unknown-action warning is an accepted
deviation. Reason: logging is debug noise, not behaviour.

### Light-theme contrast — change (deliberate)

The legacy light-theme colours (white text on red/gray, red value text) fail
the 4.5:1 contrast ratio. The light-theme palette
tokens were adjusted on purpose to meet 4.5:1. This is a deliberate,
recorded change from the legacy look.

## Consequences

- The repository gains a toolchain (`package.json`, Vite, Vitest) and loses
  the "open the file directly" portability that ADR 0001 valued.
- Reducer, theme logic and components can be unit-tested in isolation.
- Opening a single HTML file no longer works; a dev server or a static server
  for `dist/` is required.
- The theme choice is not remembered between visits.
- The behaviour changes above (initial render, styled +4/x2, no console
  output, adjusted light-theme palette) are intentional and covered by tests.
- Any later revisit of this architecture must produce a new ADR rather than
  an ad-hoc change.
