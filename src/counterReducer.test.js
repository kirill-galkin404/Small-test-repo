import { describe, it, expect, vi, afterEach } from 'vitest';
import { ACTION, initialState, reducer } from './counterReducer.js';

afterEach(() => vi.restoreAllMocks());

describe('counterReducer', () => {
  it('starts at value 0 and clicks 0', () => {
    expect(initialState).toEqual({ value: 0, clicks: 0 });
  });

  it('freezes ACTION with the expected values', () => {
    expect(Object.isFrozen(ACTION)).toBe(true);
    expect(ACTION).toEqual({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
  });

  it('INCREMENT adds 1', () => {
    expect(reducer({ value: 5, clicks: 2 }, { type: ACTION.INCREMENT }).value).toBe(6);
  });

  it('DECREMENT subtracts 1 and may go negative', () => {
    expect(reducer({ value: 0, clicks: 0 }, { type: ACTION.DECREMENT }).value).toBe(-1);
  });

  it('RESET sets value to 0', () => {
    expect(reducer({ value: 42, clicks: 3 }, { type: ACTION.RESET }).value).toBe(0);
  });

  it('ADD_FOUR adds 4', () => {
    expect(reducer({ value: 3, clicks: 0 }, { type: ACTION.ADD_FOUR }).value).toBe(7);
  });

  it('DOUBLE doubles the value', () => {
    expect(reducer({ value: 7, clicks: 0 }, { type: ACTION.DOUBLE }).value).toBe(14);
    expect(reducer({ value: -3, clicks: 0 }, { type: ACTION.DOUBLE }).value).toBe(-6);
  });

  it('has no upper bound', () => {
    expect(reducer({ value: 1000, clicks: 0 }, { type: ACTION.DOUBLE }).value).toBe(2000);
  });

  it('counts a click for every recognized action, including RESET, never resetting', () => {
    let state = initialState;
    for (const type of Object.values(ACTION)) {
      const before = state.clicks;
      state = reducer(state, { type });
      expect(state.clicks).toBe(before + 1);
    }
    expect(state.clicks).toBe(5);
    state = reducer(state, { type: ACTION.RESET });
    expect(state.clicks).toBe(6);
  });

  it('does not mutate the previous state', () => {
    const state = Object.freeze({ value: 1, clicks: 0 });
    const next = reducer(state, { type: ACTION.INCREMENT });
    expect(next).not.toBe(state);
    expect(state).toEqual({ value: 1, clicks: 0 });
  });

  it('warns on an unknown action and returns the identical state', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = { value: 3, clicks: 4 };
    const next = reducer(state, { type: 99 });
    expect(next).toBe(state);
    expect(next).toEqual({ value: 3, clicks: 4 });
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
