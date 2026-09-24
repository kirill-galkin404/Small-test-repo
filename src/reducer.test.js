import { describe, it, expect } from 'vitest';
import { counterReducer } from './reducer.js';
import { ACTION } from './actions.js';

describe('counterReducer', () => {
  it('returns state unchanged for an unmapped/undefined action (guard path 2)', () => {
    const state = { c: 5, cc: 2 };

    const result = counterReducer(state, 999);

    expect(result).toEqual({ c: 5, cc: 2 });
  });

  it('returns state unchanged for an undefined action value', () => {
    const state = { c: 5, cc: 2 };

    const result = counterReducer(state, undefined);

    expect(result).toEqual({ c: 5, cc: 2 });
  });

  it('increments cc by exactly 1 per dispatch regardless of the magnitude of change to c', () => {
    const state = { c: 10, cc: 0 };

    const addFourResult = counterReducer(state, ACTION.ADD_FOUR);
    expect(addFourResult.cc).toBe(1);
    expect(addFourResult.c).toBe(14);

    const doubleResult = counterReducer(state, ACTION.DOUBLE);
    expect(doubleResult.cc).toBe(1);
    expect(doubleResult.c).toBe(20);
  });

  it('INCREMENT: c = c + 1', () => {
    const state = { c: 3, cc: 0 };

    const result = counterReducer(state, ACTION.INCREMENT);

    expect(result).toEqual({ c: 4, cc: 1 });
  });

  it('DECREMENT: c = c - 1', () => {
    const state = { c: 3, cc: 0 };

    const result = counterReducer(state, ACTION.DECREMENT);

    expect(result).toEqual({ c: 2, cc: 1 });
  });

  it('RESET: c = 0 unconditionally, regardless of current value', () => {
    const state = { c: 42, cc: 7 };

    const result = counterReducer(state, ACTION.RESET);

    expect(result).toEqual({ c: 0, cc: 8 });
  });

  it('ADD_FOUR: c = c + 4', () => {
    const state = { c: 3, cc: 0 };

    const result = counterReducer(state, ACTION.ADD_FOUR);

    expect(result).toEqual({ c: 7, cc: 1 });
  });

  it('DOUBLE: c = c * 2', () => {
    const state = { c: 3, cc: 0 };

    const result = counterReducer(state, ACTION.DOUBLE);

    expect(result).toEqual({ c: 6, cc: 1 });
  });
});
