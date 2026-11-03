export const ACTION = Object.freeze({
  INCREMENT: 1,
  DECREMENT: 2,
  RESET: 3,
  ADD_FOUR: 4,
  DOUBLE: 5,
});

export const initialState = { value: 0, clickCount: 0 };

export function counterReducer(state, action) {
  let value;
  switch (action && action.type) {
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
      console.warn("dispatch: unrecognized action", action && action.type);
      return state;
  }
  return { value, clickCount: state.clickCount + 1 };
}
