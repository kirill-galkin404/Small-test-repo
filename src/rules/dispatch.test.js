import { describe, it, expect } from 'vitest'
import { dispatch, ACTION } from './dispatch.js'

describe('dispatch validation and click accounting', () => {
  it('applies a recognized action and increments cc by exactly 1', () => {
    const state = { c: 0, cc: 0 }
    const next = dispatch(state, ACTION.INCREMENT)
    expect(next).toEqual({ c: 1, cc: 1 })
  })

  it('leaves state unchanged for an unrecognized action code', () => {
    const state = { c: 5, cc: 2 }
    const next = dispatch(state, 999)
    expect(next).toEqual(state)
  })

  it('leaves state unchanged when there is no action (undefined action code)', () => {
    const state = { c: 5, cc: 2 }
    const next = dispatch(state, undefined)
    expect(next).toEqual(state)
  })

  it('accumulates cc across multiple recognized dispatches', () => {
    let state = { c: 0, cc: 0 }
    state = dispatch(state, ACTION.INCREMENT)
    state = dispatch(state, ACTION.DOUBLE)
    state = dispatch(state, ACTION.ADD_FOUR)
    expect(state).toEqual({ c: 6, cc: 3 })
  })

  it('does not increment cc when the action is unrecognized', () => {
    const state = { c: 0, cc: 0 }
    const next = dispatch(state, 999)
    expect(next.cc).toBe(0)
  })
})
