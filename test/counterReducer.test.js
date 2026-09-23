const counterReducer = require('../src/counterReducer.js');

describe('counterReducer action formulas (R-0001 through R-0005)', () => {
  test('INCREMENT: c = c + 1', () => {
    const state = { c: 5, cc: 0 };
    const next = counterReducer(state, 'INCREMENT');
    expect(next.c).toBe(6);
  });

  test('DECREMENT: c = c - 1, no lower bound (can go negative)', () => {
    const state = { c: 0, cc: 0 };
    const next = counterReducer(state, 'DECREMENT');
    expect(next.c).toBe(-1);
  });

  test('RESET: c becomes exactly 0 regardless of prior value', () => {
    const state = { c: 27, cc: 4 };
    const next = counterReducer(state, 'RESET');
    expect(next.c).toBe(0);
  });

  test('ADD_FOUR: c = c + 4', () => {
    const state = { c: 3, cc: 0 };
    const next = counterReducer(state, 'ADD_FOUR');
    expect(next.c).toBe(7);
  });

  test('DOUBLE: c = c * 2', () => {
    const state = { c: 6, cc: 0 };
    const next = counterReducer(state, 'DOUBLE');
    expect(next.c).toBe(12);
  });
});

describe('counterReducer dispatch/click-count policy (R-0008)', () => {
  test.each([
    ['INCREMENT'],
    ['DECREMENT'],
    ['RESET'],
    ['ADD_FOUR'],
    ['DOUBLE'],
  ])('cc increments by exactly 1 for recognized action %s', (actionType) => {
    const state = { c: 5, cc: 4 };
    const next = counterReducer(state, actionType);
    expect(next.cc).toBe(5);
  });

  test('RESET zeroes c but does NOT reset cc (cc keeps counting)', () => {
    const state = { c: 27, cc: 4 };
    const next = counterReducer(state, 'RESET');
    expect(next.c).toBe(0);
    expect(next.cc).toBe(5);
  });

  test('unrecognized actionType returns the SAME state reference, unchanged', () => {
    const state = { c: 5, cc: 4 };
    const next = counterReducer(state, 'NOT_A_REAL_ACTION');
    expect(next).toBe(state);
    expect(next.c).toBe(5);
    expect(next.cc).toBe(4);
  });

  test('undefined actionType returns the SAME state reference, unchanged', () => {
    const state = { c: 5, cc: 4 };
    const next = counterReducer(state, undefined);
    expect(next).toBe(state);
  });
});

describe('counterReducer new-object semantics', () => {
  test('recognized action returns a NEW object, not the same reference', () => {
    const state = { c: 5, cc: 4 };
    const next = counterReducer(state, 'INCREMENT');
    expect(next).not.toBe(state);
  });
});
