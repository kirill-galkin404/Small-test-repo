// Pure business rules for the counter. No UI framework and no browser APIs here.

export const ACTIONS = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
});

// high when value > thresholds.high, low when value < thresholds.low
export const HIGH_THRESHOLD = 10;
export const LOW_THRESHOLD = 0;
export const thresholds = Object.freeze({ high: HIGH_THRESHOLD, low: LOW_THRESHOLD });

export const initialState = Object.freeze({ value: 0, count: 0 });

const apply = {
  INCREMENT: (value) => value + 1,
  DECREMENT: (value) => value - 1,
  RESET: () => 0,
  ADD_FOUR: (value) => value + 4,
  DOUBLE: (value) => value * 2,
};

export function reducer(state, action) {
  const type = action && action.type;
  if (typeof type !== 'string' || !Object.prototype.hasOwnProperty.call(ACTIONS, type)) {
    return state;
  }
  return { value: apply[type](state.value), count: state.count + 1 };
}

export function colorFor(value) {
  if (value > thresholds.high) return 'high';
  if (value < thresholds.low) return 'low';
  return 'normal';
}

export function titleFor(count) {
  return count === 1 ? 'Counter (1 click)' : `Counter (${count} clicks)`;
}
