/**
 * counterReducer(state, actionType) => nextState
 *
 * A pure, side-effect-free reducer implementing the five recognized
 * counter actions documented in RULES.md (R-0001 through R-0005), plus
 * the dispatch/click-count policy (R-0008).
 *
 * Contract:
 *   - `state` is exactly `{ c, cc }` (see RULES.md "State shape").
 *   - `actionType` is one of the five recognized strings:
 *       "INCREMENT", "DECREMENT", "RESET", "ADD_FOUR", "DOUBLE"
 *   - For a recognized action, returns a NEW state object with the
 *     matching formula applied to `c`, and `cc` incremented by exactly
 *     1 (RESET included — RESET only zeroes `c`, it never resets `cc`).
 *   - For any unrecognized `actionType` (including undefined/null/
 *     anything not in the five above), returns the SAME `state`
 *     unchanged (same reference) — no mutation, no `cc` increment.
 *   - Contains no DOM access, no globals, no I/O: safe to run in Node,
 *     a browser `<script>` tag, or a test runner.
 */
function counterReducer(state, actionType) {
  var c = state.c;
  var cc = state.cc;

  switch (actionType) {
    case 'INCREMENT':
      return { c: c + 1, cc: cc + 1 };
    case 'DECREMENT':
      return { c: c - 1, cc: cc + 1 };
    case 'RESET':
      return { c: 0, cc: cc + 1 };
    case 'ADD_FOUR':
      return { c: c + 4, cc: cc + 1 };
    case 'DOUBLE':
      return { c: c * 2, cc: cc + 1 };
    default:
      return state;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = counterReducer;
}
