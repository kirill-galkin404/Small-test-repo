// Pure reducer for the counter. Actions are objects of the form { type: ACTION.X }.
// Unrecognized actions return the same state object unchanged.
export const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });

export const initialState = Object.freeze({ c: 0, cc: 0 });

export function counterReducer(state, action) {
  let c;
  switch (action && action.type) {
    case ACTION.INCREMENT:
      c = state.c + 1;
      break;
    case ACTION.DECREMENT:
      c = state.c - 1;
      break;
    case ACTION.RESET:
      c = 0;
      break;
    case ACTION.ADD_FOUR:
      c = state.c + 4;
      break;
    case ACTION.DOUBLE:
      c = state.c * 2;
      break;
    default:
      return state;
  }
  return { c, cc: state.cc + 1 };
}
