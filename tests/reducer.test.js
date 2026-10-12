import { describe, it, expect } from 'vitest';
import { ACTION, initialState, reducer } from '../src/reducer.js';

const s = (value, clicks = 0) => ({ value, clicks });

describe('ACTION', () => {
  it('is frozen and has the legacy numeric values', () => {
    expect(Object.isFrozen(ACTION)).toBe(true);
    expect(ACTION).toEqual({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
    expect(() => { ACTION.INCREMENT = 99; }).toThrow(TypeError);
    expect(ACTION.INCREMENT).toBe(1);
  });

  it('lookup of an unknown name is undefined; an inherited name yields a function the reducer ignores', () => {
    expect(ACTION['bogus']).toBeUndefined();
    expect(typeof ACTION['toString']).toBe('function');
    const state = s(3, 2);
    expect(reducer(state, ACTION['bogus'])).toBe(state);
    expect(reducer(state, ACTION['toString'])).toBe(state);
  });
});

describe('initialState', () => {
  it('starts at 0 value and 0 clicks', () => {
    expect(initialState).toEqual({ value: 0, clicks: 0 });
  });
});

describe('reducer actions', () => {
  it('INCREMENT adds 1', () => {
    expect(reducer(s(0), ACTION.INCREMENT).value).toBe(1);
    expect(reducer(s(-1), ACTION.INCREMENT).value).toBe(0);
  });
  it('DECREMENT subtracts 1, going below zero', () => {
    expect(reducer(s(0), ACTION.DECREMENT).value).toBe(-1);
    expect(reducer(s(5), ACTION.DECREMENT).value).toBe(4);
  });
  it('RESET sets 0', () => {
    expect(reducer(s(42), ACTION.RESET).value).toBe(0);
    expect(reducer(s(-7), ACTION.RESET).value).toBe(0);
  });
  it('ADD_FOUR adds 4', () => {
    expect(reducer(s(0), ACTION.ADD_FOUR).value).toBe(4);
    expect(reducer(s(-10), ACTION.ADD_FOUR).value).toBe(-6);
  });
  it('DOUBLE doubles, including negatives and zero', () => {
    expect(reducer(s(3), ACTION.DOUBLE).value).toBe(6);
    expect(reducer(s(-3), ACTION.DOUBLE).value).toBe(-6);
    expect(reducer(s(0), ACTION.DOUBLE).value).toBe(0);
  });
  it('has no upper or lower bound', () => {
    expect(reducer(s(1000000), ACTION.INCREMENT).value).toBe(1000001);
    expect(reducer(s(-1000000), ACTION.DECREMENT).value).toBe(-1000001);
    expect(reducer(s(1e15), ACTION.DOUBLE).value).toBe(2e15);
    let st = s(1);
    for (let i = 0; i < 40; i++) st = reducer(st, ACTION.DOUBLE);
    expect(st.value).toBe(2 ** 40);
  });
});

describe('click tally', () => {
  it.each(Object.entries(ACTION))('%s increments clicks by one', (_name, a) => {
    expect(reducer(s(5, 7), a).clicks).toBe(8);
  });

  it('RESET counts as a click and never resets the tally', () => {
    let st = reducer(s(9, 4), ACTION.RESET);
    expect(st).toEqual({ value: 0, clicks: 5 });
    st = reducer(st, ACTION.RESET);
    expect(st.clicks).toBe(6);
  });

  it('accumulates across a sequence', () => {
    let st = initialState;
    for (const a of [ACTION.INCREMENT, ACTION.DOUBLE, ACTION.ADD_FOUR, ACTION.DECREMENT, ACTION.RESET]) {
      st = reducer(st, a);
    }
    expect(st).toEqual({ value: 0, clicks: 5 });
  });
});

describe('unknown actions', () => {
  it.each([
    ['undefined', undefined],
    ['99', 99],
    ['0', 0],
    ['null', null],
    ['string', 'INCREMENT'],
    ['numeric string', '1'],
    ['ACTION.toString', ACTION.toString],
    ['object', {}],
  ])('%s returns the identical state object', (_n, a) => {
    const state = s(3, 2);
    expect(reducer(state, a)).toBe(state);
    expect(state).toEqual({ value: 3, clicks: 2 });
  });
});

describe('purity', () => {
  it('does not mutate input and returns a new object for recognised actions', () => {
    for (const a of Object.values(ACTION)) {
      const state = Object.freeze(s(3, 2));
      const next = reducer(state, a);
      expect(next).not.toBe(state);
      expect(state).toEqual({ value: 3, clicks: 2 });
    }
  });
  it('works on the frozen initialState', () => {
    expect(reducer(initialState, ACTION.INCREMENT)).toEqual({ value: 1, clicks: 1 });
    expect(initialState).toEqual({ value: 0, clicks: 0 });
  });
});
