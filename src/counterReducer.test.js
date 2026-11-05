import { counterReducer, initialState, ACTION } from './counterReducer';

const run = (state, ...types) =>
  types.reduce((s, type) => counterReducer(s, { type }), state);

describe('counterReducer', () => {
  it('starts at value 0 and clicks 0', () => {
    expect(initialState).toEqual({ value: 0, clicks: 0 });
  });

  it.each([
    [ACTION.INCREMENT, 5, 6],
    [ACTION.DECREMENT, 5, 4],
    [ACTION.RESET, 5, 0],
    [ACTION.ADD_FOUR, 5, 9],
    [ACTION.DOUBLE, 5, 10],
  ])('%s from %i gives %i and counts one click', (type, from, to) => {
    expect(counterReducer({ value: from, clicks: 2 }, { type })).toEqual({
      value: to,
      clicks: 3,
    });
  });

  it('handles negatives without bounds', () => {
    expect(run(initialState, ACTION.DECREMENT, ACTION.DECREMENT).value).toBe(-2);
    expect(counterReducer({ value: -3, clicks: 0 }, { type: ACTION.DOUBLE }).value).toBe(-6);
    expect(counterReducer({ value: -3, clicks: 0 }, { type: ACTION.ADD_FOUR }).value).toBe(1);
    expect(counterReducer({ value: 100, clicks: 0 }, { type: ACTION.INCREMENT }).value).toBe(101);
  });

  it('counts RESET as a click even when already zero', () => {
    expect(counterReducer(initialState, { type: ACTION.RESET })).toEqual({ value: 0, clicks: 1 });
  });

  it('tallies every recognized action', () => {
    const s = run(initialState, 'INCREMENT', 'ADD_FOUR', 'DOUBLE', 'DECREMENT', 'RESET');
    expect(s).toEqual({ value: 0, clicks: 5 });
  });

  it('warns on unrecognized actions and returns same state without a click', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = { value: 3, clicks: 7 };
    expect(counterReducer(state, { type: 'NOPE' })).toBe(state);
    expect(counterReducer(state, { type: undefined })).toBe(state);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('does not mutate the input state', () => {
    const state = Object.freeze({ value: 1, clicks: 1 });
    expect(counterReducer(state, { type: ACTION.INCREMENT })).not.toBe(state);
    expect(state).toEqual({ value: 1, clicks: 1 });
  });
});
