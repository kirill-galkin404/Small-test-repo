import { ACTION } from './actions.js';

/**
 * @typedef {{ c: number, cc: number }} State
 * @typedef {import('./actions.js').Action} Action
 */

/**
 * Pure transition table mapping each of the 5 ACTION values to the
 * corresponding update of `c`, per RULES.md §2. Typed as a `Record` over
 * the full `Action` union so that omitting any member here is a type error
 * (caught by `tsc --noEmit`), giving us exhaustiveness checking without a
 * switch statement.
 *
 * @type {Record<Action, (c: number) => number>}
 */
const TRANSITIONS = {
  [ACTION.INCREMENT]: (c) => c + 1,
  [ACTION.DECREMENT]: (c) => c - 1,
  [ACTION.RESET]: () => 0,
  [ACTION.ADD_FOUR]: (c) => c + 4,
  [ACTION.DOUBLE]: (c) => c * 2,
};

/**
 * Pure reducer replicating the original `dispatch(x)` switch's behaviour
 * exactly (see RULES.md §2-§4).
 *
 * - For any of the 5 recognized `ACTION` values, applies the matching
 *   transition to `c` and increments `cc` by exactly 1 (§3), regardless of
 *   the magnitude of the change to `c`.
 * - For any unrecognized/undefined action (RULES.md §4, guard path 2),
 *   returns the same state unchanged — no `c` change, no `cc` increment.
 *
 * Does not mutate the input state; always returns a new object on the
 * success path.
 *
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
export function counterReducer(state, action) {
  const transition = TRANSITIONS[action];
  if (!transition) {
    return state;
  }

  return {
    c: transition(state.c),
    cc: state.cc + 1,
  };
}
