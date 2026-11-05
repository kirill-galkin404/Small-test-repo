import { describe, it, expect, vi, afterEach } from 'vitest';
import { ACTION, initialState, counterReducer } from './counterReducer.js';

describe('counterReducer', () => {
  afterEach(() => vi.restoreAllMocks());

  it('starts at value 0 and clicks 0', () => {
    expect(initialState).toEqual({ value: 0, clicks: 0 });
  });

  it('INCREMENT adds 1', () => {
    expect(counterReducer({ value: 5, clicks: 0 }, ACTION.INCREMENT).value).toBe(6);
  });

  it('DECREMENT subtracts 1 and can go negative', () => {
    expect(counterReducer({ value: 5, clicks: 0 }, ACTION.DECREMENT).value).toBe(4);
    expect(counterReducer({ value: 0, clicks: 0 }, ACTION.DECREMENT).value).toBe(-1);
  });

  it('RESET sets value to 0', () => {
    expect(counterReducer({ value: 42, clicks: 3 }, ACTION.RESET).value).toBe(0);
    expect(counterReducer({ value: -7, clicks: 3 }, ACTION.RESET).value).toBe(0);
  });

  it('ADD_FOUR adds 4', () => {
    expect(counterReducer({ value: 1, clicks: 0 }, ACTION.ADD_FOUR).value).toBe(5);
  });

  it('DOUBLE multiplies by 2, including negatives', () => {
    expect(counterReducer({ value: 3, clicks: 0 }, ACTION.DOUBLE).value).toBe(6);
    expect(counterReducer({ value: -3, clicks: 0 }, ACTION.DOUBLE).value).toBe(-6);
    expect(counterReducer({ value: 0, clicks: 0 }, ACTION.DOUBLE).value).toBe(0);
  });

  it('has no upper bound', () => {
    expect(counterReducer({ value: 1000, clicks: 0 }, ACTION.DOUBLE).value).toBe(2000);
  });

  it.each(Object.entries(ACTION))('%s increments clicks by 1', (_name, action) => {
    expect(counterReducer({ value: 2, clicks: 4 }, action).clicks).toBe(5);
  });

  it('RESET keeps clicks and still counts as a click', () => {
    expect(counterReducer({ value: 9, clicks: 2 }, ACTION.RESET)).toEqual({ value: 0, clicks: 3 });
  });

  it('does not mutate the previous state', () => {
    const state = { value: 1, clicks: 1 };
    counterReducer(state, ACTION.INCREMENT);
    expect(state).toEqual({ value: 1, clicks: 1 });
  });

  it('unknown action returns the same state reference and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = { value: 3, clicks: 2 };
    expect(counterReducer(state, 99)).toBe(state);
    expect(counterReducer(state, undefined)).toBe(state);
    expect(warn).toHaveBeenCalled();
  });
});
