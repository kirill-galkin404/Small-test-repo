import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACTIONS, counterReducer, headingFor, initialState, toneFor } from './counterReducer.js'
import { actionCases, headingCases, toneCases, unknownCases } from './test/parityCases.js'

describe('initial state and ACTIONS', () => {
  it('starts at value 0 with no clicks', () => {
    expect(initialState).toEqual({ value: 0, clicks: 0 })
  })

  it('exposes exactly the five legacy actions', () => {
    expect(Object.keys(ACTIONS)).toEqual(['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE'])
  })

  it('is frozen', () => {
    expect(Object.isFrozen(ACTIONS)).toBe(true)
    expect(() => {
      'use strict'
      ACTIONS.EXTRA = 'EXTRA'
    }).toThrow(TypeError)
    expect(ACTIONS.EXTRA).toBeUndefined()
  })
})

describe('counterReducer recognised actions', () => {
  it.each(actionCases)('$name', ({ type, start, expected }) => {
    const input = { ...start }
    const next = counterReducer(input, { type })
    expect(next).toEqual(expected)
    // purity: input untouched, new object returned
    expect(input).toEqual(start)
    expect(next).not.toBe(input)
  })

  it('has a parity case for every action', () => {
    const covered = new Set(actionCases.map((c) => c.type))
    expect([...covered].sort()).toEqual(Object.keys(ACTIONS).sort())
  })

  it('does not bound the value in either direction', () => {
    let state = { value: 0, clicks: 0 }
    for (let i = 0; i < 50; i++) state = counterReducer(state, { type: ACTIONS.INCREMENT })
    expect(state.value).toBe(50)
    for (let i = 0; i < 100; i++) state = counterReducer(state, { type: ACTIONS.DECREMENT })
    expect(state.value).toBe(-50)
  })

  it('tallies a click for every recognised action and RESET does not reset the tally', () => {
    let state = initialState
    for (const type of Object.values(ACTIONS)) state = counterReducer(state, { type })
    expect(state.clicks).toBe(5)
    state = counterReducer(state, { type: ACTIONS.RESET })
    expect(state).toEqual({ value: 0, clicks: 6 })
  })

  it('does not mutate the shared initial state', () => {
    counterReducer(initialState, { type: ACTIONS.INCREMENT })
    expect(initialState).toEqual({ value: 0, clicks: 0 })
  })
})

describe('counterReducer unknown actions', () => {
  let warn

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it.each(unknownCases)('$name', ({ type, start }) => {
    const state = { ...start }
    const next = counterReducer(state, { type })
    expect(next).toBe(state)
    expect(state).toEqual(start)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('does not increment the tally for unrecognised actions', () => {
    const state = { value: 2, clicks: 3 }
    expect(counterReducer(state, { type: 'NOPE' }).clicks).toBe(3)
  })
})

describe('toneFor', () => {
  it.each(toneCases)('$value -> $tone', ({ value, tone }) => {
    expect(toneFor(value)).toBe(tone)
  })
})

describe('headingFor', () => {
  it.each(headingCases)('$clicks clicks -> $heading', ({ clicks, heading }) => {
    expect(headingFor(clicks)).toBe(heading)
  })
})
