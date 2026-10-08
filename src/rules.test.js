import { describe, it, expect } from 'vitest';
import { ACTIONS, initialState, reducer, colorFor, titleFor, thresholds } from './rules.js';

const run = (state, ...types) => types.reduce((s, type) => reducer(s, { type }), state);

describe('reducer', () => {
  it('starts at value 0, count 0', () => {
    expect(initialState).toEqual({ value: 0, count: 0 });
  });
  it('INCREMENT adds 1', () => {
    expect(reducer(initialState, { type: 'INCREMENT' })).toEqual({ value: 1, count: 1 });
  });
  it('DECREMENT subtracts 1 with no lower bound', () => {
    expect(reducer(initialState, { type: 'DECREMENT' })).toEqual({ value: -1, count: 1 });
  });
  it('RESET sets value to 0 and still counts', () => {
    expect(reducer({ value: 9, count: 3 }, { type: 'RESET' })).toEqual({ value: 0, count: 4 });
    expect(reducer(initialState, { type: 'RESET' })).toEqual({ value: 0, count: 1 });
  });
  it('ADD_FOUR adds 4', () => {
    expect(reducer(initialState, { type: 'ADD_FOUR' })).toEqual({ value: 4, count: 1 });
  });
  it('DOUBLE multiplies by 2 and still counts on 0', () => {
    expect(reducer({ value: 5, count: 0 }, { type: 'DOUBLE' })).toEqual({ value: 10, count: 1 });
    expect(reducer(initialState, { type: 'DOUBLE' })).toEqual({ value: 0, count: 1 });
  });
  it('has no upper bound', () => {
    expect(run({ value: 1000, count: 0 }, 'DOUBLE', 'ADD_FOUR')).toEqual({ value: 2004, count: 2 });
  });
  it('count never decrements or resets', () => {
    const s = run(initialState, 'INCREMENT', 'DECREMENT', 'RESET', 'DOUBLE', 'ADD_FOUR');
    expect(s.count).toBe(5);
  });
  it('ignores unknown and inherited-key actions, returning the same state', () => {
    const s = { value: 4, count: 1 };
    for (const type of ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'NOPE', '', 'increment']) {
      expect(reducer(s, { type })).toBe(s);
    }
    expect(reducer(s, { type: 5 })).toBe(s);
    expect(reducer(s, {})).toBe(s);
    expect(reducer(s)).toBe(s);
    expect(reducer(s, null)).toBe(s);
  });
  it('never mutates the previous state', () => {
    const s = Object.freeze({ value: 2, count: 2 });
    for (const type of Object.keys(ACTIONS)) reducer(s, { type });
    expect(s).toEqual({ value: 2, count: 2 });
  });
});

describe('colorFor', () => {
  it('is high above 10', () => {
    expect(colorFor(11)).toBe('high');
  });
  it('is normal at 10 and 0', () => {
    expect(colorFor(10)).toBe('normal');
    expect(colorFor(0)).toBe('normal');
  });
  it('is low below 0', () => {
    expect(colorFor(-1)).toBe('low');
  });
  it('matches the thresholds', () => {
    expect(thresholds).toEqual({ high: 10, low: 0 });
  });
});

describe('titleFor', () => {
  it('uses the right wording', () => {
    expect(titleFor(0)).toBe('Counter (0 clicks)');
    expect(titleFor(1)).toBe('Counter (1 click)');
    expect(titleFor(2)).toBe('Counter (2 clicks)');
  });
});
