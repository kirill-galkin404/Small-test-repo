// Pure dispatch validation and click-accounting for the counter widget.
// See RULES.md for the business-rule definitions these implement.

import { increment, decrement, reset, addFour, double } from './arithmetic.js'

export const ACTION = Object.freeze({
  INCREMENT: 1,
  DECREMENT: 2,
  RESET: 3,
  ADD_FOUR: 4,
  DOUBLE: 5,
})

const ARITHMETIC_BY_ACTION = {
  [ACTION.INCREMENT]: increment,
  [ACTION.DECREMENT]: decrement,
  [ACTION.RESET]: reset,
  [ACTION.ADD_FOUR]: addFour,
  [ACTION.DOUBLE]: double,
}

// dispatch({c, cc}, actionCode) -> new {c, cc} state, or the same state
// object when actionCode does not match any known action.
export function dispatch(state, actionCode) {
  const arithmetic = ARITHMETIC_BY_ACTION[actionCode]
  if (!arithmetic) {
    return state
  }

  return {
    c: arithmetic(state.c),
    cc: state.cc + 1,
  }
}
