import { describe, it, expect } from 'vitest';
import { ACTION, initialState, counterReducer, toneFor } from './counterReducer.js';

// Actions are plain string types: counterReducer(state, ACTION.X).
const run = (state, ...actions) => actions.reduce(counterReducer, state);

describe('counterReducer', () => {
  it('starts at zero value and zero clicks', () => {
    expect(initialState).toEqual({ value: 0, clicks: 0 });
  });

  it('applies each action to the value', () => {
    const s = { value: 3, clicks: 0 };
    expect(counterReducer(s, ACTION.INCREMENT).value).toBe(4);
    expect(counterReducer(s, ACTION.DECREMENT).value).toBe(2);
    expect(counterReducer(s, ACTION.ADD_FOUR).value).toBe(7);
    expect(counterReducer(s, ACTION.DOUBLE).value).toBe(6);
    expect(counterReducer(s, ACTION.RESET).value).toBe(0);
  });

  it('follows a sequence from 3 and counts every action including reset', () => {
    let s = { value: 3, clicks: 0 };
    s = counterReducer(s, ACTION.INCREMENT);
    expect(s).toEqual({ value: 4, clicks: 1 });
    s = counterReducer(s, ACTION.DOUBLE);
    expect(s.value).toBe(8);
    s = counterReducer(s, ACTION.DOUBLE);
    expect(s.value).toBe(16);
    s = counterReducer(s, ACTION.DECREMENT);
    expect(s.value).toBe(15);
    s = counterReducer(s, ACTION.RESET);
    expect(s).toEqual({ value: 0, clicks: 5 });
  });

  it('does not reset the tally on reset and does not mutate input', () => {
    const s = Object.freeze({ value: 5, clicks: 2 });
    expect(counterReducer(s, ACTION.RESET)).toEqual({ value: 0, clicks: 3 });
    expect(s).toEqual({ value: 5, clicks: 2 });
  });

  it('has no lower or upper bound', () => {
    expect(run(initialState, ACTION.DECREMENT, ACTION.DECREMENT).value).toBe(-2);
    expect(run({ value: -3, clicks: 0 }, ACTION.DOUBLE).value).toBe(-6);
    expect(run({ value: 1000000, clicks: 0 }, ACTION.DOUBLE, ACTION.ADD_FOUR).value).toBe(2000004);
  });

  it('returns the identical state object for unknown actions', () => {
    const s = { value: 7, clicks: 3 };
    expect(counterReducer(s, 'NOPE')).toBe(s);
    expect(counterReducer(s, undefined)).toBe(s);
    expect(counterReducer(s, 1)).toBe(s);
  });

  it('exports a frozen ACTION map', () => {
    expect(Object.isFrozen(ACTION)).toBe(true);
    expect(Object.keys(ACTION).sort()).toEqual(['ADD_FOUR', 'DECREMENT', 'DOUBLE', 'INCREMENT', 'RESET']);
  });
});

describe('toneFor', () => {
  it('is high above 10', () => {
    expect(toneFor(11)).toBe('high');
    expect(toneFor(1000)).toBe('high');
  });
  it('is low below 0', () => {
    expect(toneFor(-1)).toBe('low');
    expect(toneFor(-50)).toBe('low');
  });
  it('is neutral at the 10 and 0 boundaries and between', () => {
    expect(toneFor(10)).toBe('neutral');
    expect(toneFor(0)).toBe('neutral');
    expect(toneFor(5)).toBe('neutral');
  });
});
