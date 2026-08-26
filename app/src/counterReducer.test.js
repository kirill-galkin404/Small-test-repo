import { describe, expect, it } from 'vitest'
import { counterReducer } from './counterReducer.js'

describe('counterReducer', () => {
  it('DECREMENT decrements c and increments cc', () => {
    expect(counterReducer({ c: 0, cc: 0 }, { type: 'DECREMENT' })).toEqual({
      c: -1,
      cc: 1,
    })
  })

  it('INCREMENT increments c and cc', () => {
    expect(counterReducer({ c: 0, cc: 0 }, { type: 'INCREMENT' })).toEqual({
      c: 1,
      cc: 1,
    })
  })

  it('ADD_FOUR adds four to c and increments cc', () => {
    expect(counterReducer({ c: 2, cc: 0 }, { type: 'ADD_FOUR' })).toEqual({
      c: 6,
      cc: 1,
    })
  })

  it('DOUBLE doubles c and increments cc', () => {
    expect(counterReducer({ c: 3, cc: 0 }, { type: 'DOUBLE' })).toEqual({
      c: 6,
      cc: 1,
    })
  })

  it('RESET resets c to 0 and increments cc', () => {
    expect(counterReducer({ c: 5, cc: 2 }, { type: 'RESET' })).toEqual({
      c: 0,
      cc: 3,
    })
  })

  it('unrecognized action returns state unchanged without incrementing cc', () => {
    expect(counterReducer({ c: 7, cc: 4 }, { type: 'UNKNOWN' })).toEqual({
      c: 7,
      cc: 4,
    })
  })
})
