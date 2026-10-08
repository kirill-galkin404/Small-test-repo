export const ACTION_TYPES = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
});

export const initialState = { c: 0, cc: 0 };

const transitions = {
  [ACTION_TYPES.INCREMENT]: (c) => c + 1,
  [ACTION_TYPES.DECREMENT]: (c) => c - 1,
  [ACTION_TYPES.RESET]: () => 0,
  [ACTION_TYPES.ADD_FOUR]: (c) => c + 4,
  [ACTION_TYPES.DOUBLE]: (c) => c * 2,
};

export function counterReducer(state, action) {
  if (action === null || typeof action !== 'object') return state;
  const type = action.type;
  if (typeof type !== 'string' || !Object.hasOwn(transitions, type)) return state;
  return { c: transitions[type](state.c), cc: state.cc + 1 };
}

export function valueTone(c) {
  if (c > 10) return 'high';
  if (c < 0) return 'low';
  return 'neutral';
}

export function titleText(cc) {
  return cc === 0 ? 'Counter' : `Counter (${cc} clicks)`;
}
