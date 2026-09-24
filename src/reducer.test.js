import { describe, it, expect } from 'vitest';
import { ACTIONS, reducer } from './reducer.js';

describe('reducer', () => {
  it('INCREMENT increases value by 1 and increments clicks', () => {
    const state = { value: 0, clicks: 0 };
    const next = reducer(state, { type: ACTIONS.INCREMENT });
    expect(next).toEqual({ value: 1, clicks: 1 });
  });

  it('DECREMENT decreases value by 1 and increments clicks', () => {
    const state = { value: 0, clicks: 0 };
    const next = reducer(state, { type: ACTIONS.DECREMENT });
    expect(next).toEqual({ value: -1, clicks: 1 });
  });

  it('RESET sets value to 0 but still increments clicks (clicks not reset)', () => {
    const state = { value: 42, clicks: 5 };
    const next = reducer(state, { type: ACTIONS.RESET });
    expect(next).toEqual({ value: 0, clicks: 6 });
  });

  it('ADD_FOUR increases value by 4 and increments clicks', () => {
    const state = { value: 2, clicks: 0 };
    const next = reducer(state, { type: ACTIONS.ADD_FOUR });
    expect(next).toEqual({ value: 6, clicks: 1 });
  });

  it('DOUBLE doubles value and increments clicks', () => {
    const state = { value: 3, clicks: 0 };
    const next = reducer(state, { type: ACTIONS.DOUBLE });
    expect(next).toEqual({ value: 6, clicks: 1 });
  });

  it('unrecognized action type returns the exact same state object unchanged', () => {
    const state = { value: 7, clicks: 3 };
    const next = reducer(state, { type: 'NOT_A_REAL_ACTION' });
    expect(next).toBe(state);
    expect(next).toEqual({ value: 7, clicks: 3 });
  });

  it('missing type returns the exact same state object unchanged', () => {
    const state = { value: 7, clicks: 3 };
    const next = reducer(state, {});
    expect(next).toBe(state);
  });

  it('each recognized action increments clicks by exactly 1 per dispatch', () => {
    let state = { value: 0, clicks: 0 };
    for (const type of Object.values(ACTIONS)) {
      const before = state.clicks;
      state = reducer(state, { type });
      expect(state.clicks).toBe(before + 1);
    }
  });

  it('does not mutate the input state object for recognized actions', () => {
    const state = { value: 1, clicks: 1 };
    const snapshot = { ...state };
    const next = reducer(state, { type: ACTIONS.INCREMENT });
    expect(state).toEqual(snapshot);
    expect(next).not.toBe(state);
  });
});
