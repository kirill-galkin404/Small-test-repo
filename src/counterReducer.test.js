// See RULES.md for the canonical human-readable business-rules spec this suite verifies.
import { describe, it, expect } from 'vitest';
import { ACTION, initialState, counterReducer } from './counterReducer.js';

describe('counterReducer', () => {
  it('INCREMENT increments c by 1 and cc by 1', () => {
    const state = { c: 0, cc: 0 };
    const result = counterReducer(state, { type: ACTION.INCREMENT });
    expect(result.c).toBe(1);
    expect(result.cc).toBe(1);
  });

  it('DECREMENT decrements c by 1 and increments cc by 1', () => {
    const state = { c: 5, cc: 2 };
    const result = counterReducer(state, { type: ACTION.DECREMENT });
    expect(result.c).toBe(4);
    expect(result.cc).toBe(3);
  });

  it('RESET sets c to 0 and increments cc by 1', () => {
    const state = { c: 42, cc: 3 };
    const result = counterReducer(state, { type: ACTION.RESET });
    expect(result.c).toBe(0);
    expect(result.cc).toBe(4);
  });

  it('ADD_FOUR adds 4 to c and increments cc by 1', () => {
    const state = { c: 10, cc: 1 };
    const result = counterReducer(state, { type: ACTION.ADD_FOUR });
    expect(result.c).toBe(14);
    expect(result.cc).toBe(2);
  });

  it('DOUBLE multiplies c by 2 and increments cc by 1', () => {
    const state = { c: 7, cc: 0 };
    const result = counterReducer(state, { type: ACTION.DOUBLE });
    expect(result.c).toBe(14);
    expect(result.cc).toBe(1);
  });

  it('unrecognized action leaves c and cc unchanged and returns the same state reference', () => {
    const state = { c: 3, cc: 9 };
    const result = counterReducer(state, { type: 999 });
    expect(result).toBe(state);
    expect(result.c).toBe(3);
    expect(result.cc).toBe(9);
  });

  it('initialState has c and cc at 0', () => {
    expect(initialState).toEqual({ c: 0, cc: 0 });
  });
});
