export const ACTION = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
});

export const initialState = Object.freeze({ value: 0, clicks: 0 });

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
      console.warn('dispatch: unrecognized action', action && action.type);
      return state;
  }
  return { value, clicks: state.clicks + 1 };
}
