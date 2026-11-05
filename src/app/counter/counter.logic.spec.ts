import {
  Action,
  CounterState,
  colorFor,
  dispatch,
  initialState,
  parseAction,
  titleFor,
} from './counter.logic';

function run(actions: Action[], start: CounterState = initialState): CounterState {
  return actions.reduce((s, a) => dispatch(s, a), start);
}

describe('parseAction', () => {
  it.each(['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE'])('recognizes %s', (name) => {
    expect(parseAction(name)).toBe(name);
  });

  it.each(['BOGUS', undefined, '', 'constructor', '1'])('does not recognize %p', (name) => {
    expect(parseAction(name)).toBeUndefined();
  });
});

describe('dispatch', () => {
  it('starts at value 0 and 0 clicks', () => {
    expect(initialState).toEqual({ value: 0, clicks: 0 });
  });

  it('INCREMENT adds 1', () => {
    expect(dispatch(initialState, Action.INCREMENT)).toEqual({ value: 1, clicks: 1 });
  });

  it('DECREMENT subtracts 1 with no lower bound', () => {
    expect(dispatch(initialState, Action.DECREMENT)).toEqual({ value: -1, clicks: 1 });
    expect(run([Action.DECREMENT, Action.DECREMENT, Action.DECREMENT]).value).toBe(-3);
  });

  it('RESET sets 0 and still increments clicks', () => {
    const s = run([Action.INCREMENT, Action.INCREMENT, Action.RESET]);
    expect(s).toEqual({ value: 0, clicks: 3 });
    expect(dispatch(initialState, Action.RESET)).toEqual({ value: 0, clicks: 1 });
  });

  it('ADD_FOUR adds 4', () => {
    expect(dispatch(initialState, Action.ADD_FOUR)).toEqual({ value: 4, clicks: 1 });
  });

  it('DOUBLE multiplies by 2', () => {
    expect(dispatch({ value: 5, clicks: 0 }, Action.DOUBLE)).toEqual({ value: 10, clicks: 1 });
    expect(dispatch(initialState, Action.DOUBLE)).toEqual({ value: 0, clicks: 1 });
  });

  it('doubles negative values', () => {
    expect(dispatch({ value: -3, clicks: 0 }, Action.DOUBLE).value).toBe(-6);
  });

  it('3 then x2 then +4 gives 6 then 10', () => {
    let s = run([Action.INCREMENT, Action.INCREMENT, Action.INCREMENT]);
    expect(s.value).toBe(3);
    s = dispatch(s, Action.DOUBLE);
    expect(s.value).toBe(6);
    s = dispatch(s, Action.ADD_FOUR);
    expect(s.value).toBe(10);
    expect(s.clicks).toBe(5);
  });

  it('has no upper bound', () => {
    expect(run([Action.DOUBLE], { value: 1000000, clicks: 0 }).value).toBe(2000000);
  });

  it('does not mutate the input state', () => {
    const s: CounterState = { value: 1, clicks: 1 };
    dispatch(s, Action.INCREMENT);
    expect(s).toEqual({ value: 1, clicks: 1 });
  });

  describe('unrecognized action', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('leaves state unchanged and warns', () => {
      const s: CounterState = { value: 7, clicks: 2 };
      const result = dispatch(s, parseAction('BOGUS'));
      expect(result).toBe(s);
      expect(result).toEqual({ value: 7, clicks: 2 });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith('dispatch: unrecognized action', undefined);
    });

    it('does not warn for recognized actions', () => {
      dispatch(initialState, Action.INCREMENT);
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

describe('colorFor', () => {
  it('is black at 10', () => {
    expect(colorFor(10)).toBe('black');
  });

  it('is red at 11', () => {
    expect(colorFor(11)).toBe('red');
  });

  it('is black at 0', () => {
    expect(colorFor(0)).toBe('black');
  });

  it('is blue at -1', () => {
    expect(colorFor(-1)).toBe('blue');
  });
});

describe('titleFor', () => {
  it('is plain Counter with no clicks', () => {
    expect(titleFor(0)).toBe('Counter');
  });

  it('includes click count', () => {
    expect(titleFor(1)).toBe('Counter (1 clicks)');
    expect(titleFor(12)).toBe('Counter (12 clicks)');
  });
});
