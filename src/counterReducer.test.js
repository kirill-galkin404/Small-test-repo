import { describe, it, expect, vi, afterEach } from 'vitest'
import { counterReducer, initialState, ACTION } from './counterReducer'

afterEach(() => vi.restoreAllMocks())

describe('counterReducer', () => {
  it('starts at zero', () => {
    expect(initialState).toEqual({ c: 0, cc: 0 })
  })

  it.each([
    [ACTION.INCREMENT, 5, 6],
    [ACTION.INCREMENT, -1, 0],
    [ACTION.DECREMENT, 5, 4],
    [ACTION.DECREMENT, 0, -1],
    [ACTION.RESET, 7, 0],
    [ACTION.RESET, -7, 0],
    [ACTION.ADD_FOUR, 3, 7],
    [ACTION.ADD_FOUR, -10, -6],
    [ACTION.DOUBLE, 6, 12],
    [ACTION.DOUBLE, -3, -6],
  ])('%s from %i gives %i', (action, from, to) => {
    expect(counterReducer({ c: from, cc: 0 }, action).c).toBe(to)
  })

  it.each(Object.values(ACTION))('%s increments cc by 1', (action) => {
    expect(counterReducer({ c: 2, cc: 3 }, action).cc).toBe(4)
  })

  it('RESET does not reset cc', () => {
    expect(counterReducer({ c: 9, cc: 5 }, ACTION.RESET)).toEqual({ c: 0, cc: 6 })
  })

  it('does not mutate the input state', () => {
    const state = Object.freeze({ c: 1, cc: 1 })
    expect(counterReducer(state, ACTION.INCREMENT)).not.toBe(state)
    expect(state).toEqual({ c: 1, cc: 1 })
  })

  it('has no upper or lower bound', () => {
    expect(counterReducer({ c: 1000, cc: 0 }, ACTION.DOUBLE).c).toBe(2000)
    expect(counterReducer({ c: -1000, cc: 0 }, ACTION.DECREMENT).c).toBe(-1001)
  })

  it('returns the identical state and warns on an unknown action', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const state = { c: 3, cc: 2 }
    expect(counterReducer(state, 'NOPE')).toBe(state)
    expect(counterReducer(state, undefined)).toBe(state)
    expect(warn).toHaveBeenCalledTimes(2)
  })
})
