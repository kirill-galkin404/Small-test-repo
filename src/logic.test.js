import { describe, it, expect } from 'vitest'
import { ACTIONS, initialState, reducer, valueTone, clickLabel } from './logic.js'

// Expected values in the 'characterization' group are derived from the
// behaviour of the original script this module replaces.

const run = (state, ...types) =>
  types.reduce((s, type) => reducer(s, { type }), state)

describe('characterization', () => {
  it('starts at value 0 with count 0', () => {
    expect(initialState).toEqual({ value: 0, count: 0 })
  })

  it('INCREMENT adds 1', () => {
    expect(reducer(initialState, { type: ACTIONS.INCREMENT }).value).toBe(1)
  })

  it('DECREMENT subtracts 1 with no lower bound', () => {
    expect(reducer(initialState, { type: ACTIONS.DECREMENT }).value).toBe(-1)
    expect(run(initialState, 'DECREMENT', 'DECREMENT', 'DECREMENT').value).toBe(-3)
  })

  it('RESET sets the value to 0', () => {
    expect(run(initialState, 'INCREMENT', 'INCREMENT', 'RESET').value).toBe(0)
  })

  it('ADD_FOUR adds 4', () => {
    expect(reducer(initialState, { type: ACTIONS.ADD_FOUR }).value).toBe(4)
  })

  it('DOUBLE multiplies by 2', () => {
    expect(run({ value: 3, count: 0 }, 'DOUBLE').value).toBe(6)
    expect(run({ value: -3, count: 0 }, 'DOUBLE').value).toBe(-6)
    expect(run(initialState, 'DOUBLE').value).toBe(0)
  })

  it('has no upper bound', () => {
    expect(run({ value: 1000, count: 0 }, 'DOUBLE', 'DOUBLE').value).toBe(4000)
  })

  it('count rises by one for every recognised action', () => {
    let s = initialState
    for (const type of Object.values(ACTIONS)) {
      const before = s.count
      s = reducer(s, { type })
      expect(s.count).toBe(before + 1)
    }
    expect(s.count).toBe(5)
  })

  it('RESET counts as an action but does not reset the count', () => {
    const s = run(initialState, 'INCREMENT', 'INCREMENT', 'RESET')
    expect(s).toEqual({ value: 0, count: 3 })
  })

  it('unknown actions leave the state untouched and do not count', () => {
    const s = run(initialState, 'INCREMENT')
    expect(reducer(s, { type: 'NOPE' })).toBe(s)
    expect(reducer(s, { type: undefined })).toBe(s)
    expect(reducer(s, {})).toBe(s)
    expect(reducer(s, undefined)).toBe(s)
    expect(reducer(s, { type: 'increment' })).toBe(s)
  })

  it('does not mutate the previous state', () => {
    const before = { value: 2, count: 1 }
    reducer(before, { type: ACTIONS.INCREMENT })
    expect(before).toEqual({ value: 2, count: 1 })
  })

  it('value tone thresholds: >10 high, <0 low, otherwise neutral', () => {
    expect(valueTone(10)).toBe('neutral')
    expect(valueTone(11)).toBe('high')
    expect(valueTone(0)).toBe('neutral')
    expect(valueTone(-1)).toBe('low')
  })

  it('title label for several clicks', () => {
    expect(clickLabel(0)).toBe('0 clicks')
    expect(clickLabel(2)).toBe('2 clicks')
    expect(clickLabel(12)).toBe('12 clicks')
  })
})

describe('intentional change', () => {
  it('rejects the inherited key "constructor" and returns the same state', () => {
    const s = run(initialState, 'INCREMENT')
    expect(reducer(s, { type: 'constructor' })).toBe(s)
  })

  it('rejects the inherited key "__proto__" and returns the same state', () => {
    const s = run(initialState, 'INCREMENT')
    expect(reducer(s, { type: '__proto__' })).toBe(s)
  })

  it('rejects other inherited keys such as toString and hasOwnProperty', () => {
    const s = initialState
    expect(reducer(s, { type: 'toString' })).toBe(s)
    expect(reducer(s, { type: 'hasOwnProperty' })).toBe(s)
  })

  it('pluralises the title label: "1 click" but "0 clicks" and "2 clicks"', () => {
    expect(clickLabel(1)).toBe('1 click')
    expect(clickLabel(0)).toBe('0 clicks')
    expect(clickLabel(2)).toBe('2 clicks')
  })
})
