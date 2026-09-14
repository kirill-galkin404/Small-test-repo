# Future Improvements

This document lists improvements that were identified while rewriting the
Counter widget from vanilla JS/HTML into a React + Vite application, but
were deliberately kept **out of scope** for that rewrite. The rewrite's
goal was a faithful, behavior-preserving port (components + hooks, black
theme, `useReducer` state, Vitest tests) — not a redesign of the widget's
functionality. The items below are suggestions for follow-up work.

## Accessibility (keyboard / ARIA)

- The action buttons (`+`, `-`, `reset`, `+4`, `x2`) currently have no
  `aria-label`s beyond their visible text, which may be ambiguous for
  screen reader users (e.g. "x2" and "+4" are not obviously described).
- The counter value display should be wired up as an `aria-live` region
  so assistive technology announces value changes without requiring the
  user to refocus.
- Buttons should expose clearer accessible names describing the action
  they perform (e.g. `aria-label="Increment counter"` instead of relying
  on the glyph/text alone), and focus states should be visibly styled
  against the new black theme for keyboard users.
- Full keyboard navigation and focus-order review of the action button
  group should be done as a dedicated accessibility pass.
- **Deferred from this rewrite**: no accessibility/ARIA improvements to
  the action buttons were made as part of this rewrite — the DOM
  structure and semantics were preserved as-is, and these are captured
  here purely as suggestions for a future iteration.

## Configurable color thresholds

- The color-coding thresholds (e.g. switching display color when the
  counter value goes above or below certain bounds) are currently
  hard-coded in the rendering logic.
- These thresholds should be extracted into a configuration object (or
  environment/prop-driven values) so they can be tuned without changing
  component code, and so different consumers of the widget could supply
  their own thresholds/colors.

## Persistence of counter state

- Counter state (and the click/dispatch counter) is currently held only
  in memory via `useReducer` and is lost on page reload.
- A future improvement could persist state to `localStorage` (or a
  backend) and rehydrate it on load, so the counter survives refreshes.
- **Deferred from this rewrite**: no persistence of counter state across
  page reloads was implemented, and no server-side or persisted backend
  was introduced — the widget remains entirely client-only, in memory,
  exactly as in the original vanilla JS version.

## Undo / history affordance

- There is currently no way to undo an action or view a history of past
  actions/values.
- A future improvement could track a history stack of dispatched actions
  and resulting values, exposing an "undo" (and possibly "redo") button,
  and/or a visible log of recent actions.

## Other deliberate scope deferrals for this rewrite

The following behaviors were intentionally preserved unchanged rather
than "fixed" or enhanced, to keep this rewrite a faithful port:

- **No min/max bounds enforcement**: the counter's increment, decrement,
  and double actions remain unbounded, exactly matching the original
  vanilla JS behavior. Adding configurable min/max clamping is a
  candidate for future work but was explicitly out of scope here.
- **No backend/persistence layer**: as noted above, the widget stays
  client-only with no server-side state.
- **No accessibility rework**: as noted above, ARIA/keyboard
  improvements were not part of this rewrite's scope and are suggested
  here for a follow-up effort.
