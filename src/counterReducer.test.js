import { describe, it, expect } from 'vitest';
import { ACTION, initialState, counterReducer } from './counterReducer.js';

describe('counterReducer', () => {
  it('starts at c=0, cc=0', () => {
    expect(initialState).toEqual({ c: 0, cc: 0 });
  });

  it.each([
    ['INCREMENT', 5, 6],
    ['DECREMENT', 5, 4],
    ['RESET', 5, 0],
    ['ADD_FOUR', 5, 9],
    ['DOUBLE', 5, 10],
  ])('%s changes c and increments cc', (name, from, to) => {
    const next = counterReducer({ c: from, cc: 2 }, { type: ACTION[name] });
    expect(next).toEqual({ c: to, cc: 3 });
  });

  it('allows negatives and is unbounded', () => {
    expect(counterReducer({ c: 0, cc: 0 }, { type: ACTION.DECREMENT }).c).toBe(-1);
    expect(counterReducer({ c: -3, cc: 0 }, { type: ACTION.DOUBLE }).c).toBe(-6);
    expect(counterReducer({ c: -10, cc: 0 }, { type: ACTION.ADD_FOUR }).c).toBe(-6);
    expect(counterReducer({ c: 1000, cc: 0 }, { type: ACTION.DOUBLE }).c).toBe(2000);
  });

  it('RESET does not clear cc', () => {
    expect(counterReducer({ c: 7, cc: 4 }, { type: ACTION.RESET })).toEqual({ c: 0, cc: 5 });
  });

  it('does not mutate the input state', () => {
    const state = { c: 1, cc: 1 };
    counterReducer(state, { type: ACTION.INCREMENT });
    expect(state).toEqual({ c: 1, cc: 1 });
  });

  it('returns the same state object for unknown actions', () => {
    const state = { c: 3, cc: 2 };
    expect(counterReducer(state, { type: 99 })).toBe(state);
    expect(counterReducer(state, { type: undefined })).toBe(state);
    expect(counterReducer(state, {})).toBe(state);
    expect(counterReducer(state, undefined)).toBe(state);
  });
});
