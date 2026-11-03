// Pure counter reducer.
//
// Signature: reducer(state, action) -> nextState
//   state:  { value: number, clicks: number }
//   action: { type: <numeric ACTION value> }, e.g. { type: ACTION.INCREMENT }
//
// Every recognized action updates `value` and adds 1 to `clicks` (RESET
// included; clicks is never reset). There are no bounds on `value`.
//
// An unrecognized action returns the identical state object. It also calls
// console.warn, an accepted impurity kept for parity with the original. The original console.log traces
// are intentionally dropped.

export const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });

export const initialState = { value: 0, clicks: 0 };

export function reducer(state, action) {
  let value;
  switch (action.type) {
    case ACTION.INCREMENT:
      value = state.value + 1;
      break;
    case ACTION.DECREMENT:
      value = state.value - 1;
      break;
    case ACTION.RESET:
      value = 0;
      break;
    case ACTION.ADD_FOUR:
      value = state.value + 4;
      break;
    case ACTION.DOUBLE:
      value = state.value * 2;
      break;
    default:
      console.warn('dispatch: unrecognized action', action.type);
      return state;
  }
  return { value, clicks: state.clicks + 1 };
}
