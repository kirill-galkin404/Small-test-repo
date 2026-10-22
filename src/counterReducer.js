// Pure counter logic. Actions are plain strings (see ACTION); dispatch(ACTION.X).
export const ACTION = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
});

export const initialState = { value: 0, clicks: 0 };

export function counterReducer(state, action) {
  let value;
  switch (action) {
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
      return state;
  }
  return { value, clicks: state.clicks + 1 };
}

export function toneFor(value) {
  if (value > 10) return 'high';
  if (value < 0) return 'low';
  return 'neutral';
}
