export const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });

export const initialState = { c: 0, cc: 0 };

export function counterReducer(state, action) {
  switch (action.type) {
    case ACTION.INCREMENT:
      return { c: state.c + 1, cc: state.cc + 1 };
    case ACTION.DECREMENT:
      return { c: state.c - 1, cc: state.cc + 1 };
    case ACTION.RESET:
      return { c: 0, cc: state.cc + 1 };
    case ACTION.ADD_FOUR:
      return { c: state.c + 4, cc: state.cc + 1 };
    case ACTION.DOUBLE:
      return { c: state.c * 2, cc: state.cc + 1 };
    default:
      return state;
  }
}

export default counterReducer;
