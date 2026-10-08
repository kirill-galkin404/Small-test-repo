import { describe, it, expect } from 'vitest';
import {
  ACTION_TYPES,
  initialState,
  counterReducer,
  valueTone,
  titleText,
} from './counterRules.js';

const apply = (state, type) => counterReducer(state, { type });

describe('counterReducer recognised actions', () => {
  const expected = {
    INCREMENT: (c) => c + 1,
    DECREMENT: (c) => c - 1,
    RESET: () => 0,
    ADD_FOUR: (c) => c + 4,
    DOUBLE: (c) => c * 2,
  };
  const cases = [];
  for (const type of Object.keys(expected)) {
    for (const c of [0, 3, -3, 37]) cases.push([type, c, expected[type](c)]);
  }

  it.each(cases)('%s from c=%i gives c=%i and cc+1', (type, c, want) => {
    const next = apply({ c, cc: 5 }, type);
    expect(next.c).toBe(want);
    expect(next.cc).toBe(6);
  });

  it('does not mutate the previous state', () => {
    const before = { c: 2, cc: 1 };
    apply(before, ACTION_TYPES.DOUBLE);
    expect(before).toEqual({ c: 2, cc: 1 });
  });

  it('handles negative values for DOUBLE and ADD_FOUR', () => {
    expect(apply({ c: -3, cc: 0 }, 'DOUBLE').c).toBe(-6);
    expect(apply({ c: -10, cc: 0 }, 'ADD_FOUR').c).toBe(-6);
  });

  it('RESET keeps cc incrementing and cc never decreases', () => {
    let s = initialState;
    let last = s.cc;
    for (const t of ['INCREMENT', 'RESET', 'DECREMENT', 'DOUBLE', 'RESET', 'ADD_FOUR']) {
      s = apply(s, t);
      expect(s.cc).toBe(last + 1);
      last = s.cc;
    }
    expect(s).toEqual({ c: 4, cc: 6 });
  });
});

describe('counterReducer unrecognised actions', () => {
  const state = { c: 7, cc: 3 };
  it.each(['constructor', '__proto__', 'toString', 'bogus', 'hasOwnProperty', ''])(
    'type %j leaves state identical',
    (type) => {
      const next = counterReducer(state, { type });
      expect(next).toBe(state);
      expect(next.cc).toBe(3);
    },
  );

  it.each([undefined, null, 'INCREMENT', 5, {}, { type: 1 }, { type: null }])(
    'malformed action %j leaves state identical',
    (action) => {
      expect(counterReducer(state, action)).toBe(state);
    },
  );
});

describe('valueTone', () => {
  it.each([
    [10, 'neutral'],
    [11, 'high'],
    [0, 'neutral'],
    [-1, 'low'],
  ])('c=%i is %s', (c, tone) => {
    expect(valueTone(c)).toBe(tone);
  });
});

describe('titleText', () => {
  it.each([
    [0, 'Counter'],
    [1, 'Counter (1 clicks)'],
    [4, 'Counter (4 clicks)'],
  ])('cc=%i gives %s', (cc, text) => {
    expect(titleText(cc)).toBe(text);
  });
});
