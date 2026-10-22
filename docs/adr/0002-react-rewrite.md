# 2. Rewrite the counter app in React (Vite) with tests

## Status

Proposed

## Context

ADR 0001 chose to keep the counter as a single file with no build step, no
module system and no `package.json`. That decision itself said that a revisit
should produce a new ADR rather than an ad-hoc change; this is that ADR. Once
it is accepted, ADR 0001 will be marked Superseded by 0002 (done in a later
step, not in this draft).

The counter is being rewritten as a React app built with Vite, in plain
JS/JSX (no TypeScript), with Vitest tests and a dark theme. The legacy
`counter.html`, `counter.js` and `style.css` are left untouched. This ADR
records the architecture and, below, a decision for each quirk of the legacy
behaviour.

## Decision

Use React with Vite as the build tool, plain JavaScript/JSX, and Vitest for
tests. State is held in a reducer; the legacy `dispatch` switch becomes a
pure reducer that can be tested in isolation.

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
the 4.5:1 contrast ratio. When design tokens are introduced, the light-theme
palette will be adjusted on purpose to meet 4.5:1. This is a deliberate,
recorded change from the legacy look.

## Consequences

- The repository gains a toolchain (`package.json`, Vite, Vitest) and loses
  the "open the file directly" portability that ADR 0001 valued.
- Reducer and components can be unit-tested in isolation.
- The behaviour changes above (initial render, styled +4/x2, no console
  output, adjusted light-theme palette) are intentional and covered by tests.
- Any later revisit of this architecture must produce a new ADR rather than
  an ad-hoc change.
