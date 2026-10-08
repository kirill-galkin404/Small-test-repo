import { counterReducer, INITIAL_STATE, valueTone } from './counterReducer.js'

describe('counterReducer', () => {
  it('starts at value 0 and count 0', () => {
    expect(INITIAL_STATE).toEqual({ value: 0, count: 0 })
  })

  it.each([
    ['INCREMENT', 5, 6],
    ['DECREMENT', 5, 4],
    ['RESET', 5, 0],
    ['ADD_FOUR', 5, 9],
    ['DOUBLE', 5, 10],
  ])('%s from %i gives value %i and counts the action', (type, from, expected) => {
    const next = counterReducer({ value: from, count: 3 }, { type })
    expect(next.value).toBe(expected)
    expect(next.count).toBe(4)
  })

  it('handles negative values like the legacy arithmetic', () => {
    expect(counterReducer({ value: -3, count: 0 }, { type: 'DOUBLE' }).value).toBe(-6)
    expect(counterReducer({ value: 0, count: 0 }, { type: 'DECREMENT' }).value).toBe(-1)
  })

  it('RESET sets the value to 0 but still increments the count', () => {
    const next = counterReducer({ value: 42, count: 7 }, { type: 'RESET' })
    expect(next).toEqual({ value: 0, count: 8 })
  })

  it('does not mutate the previous state', () => {
    const prev = { value: 1, count: 1 }
    counterReducer(prev, { type: 'INCREMENT' })
    expect(prev).toEqual({ value: 1, count: 1 })
  })

  it.each([
    ['unknown type', { type: 'NOPE' }],
    ['lower-case type', { type: 'increment' }],
    ['missing type', {}],
    ['undefined action', undefined],
    ['null action', null],
    ['non-string type', { type: 1 }],
    ['inherited constructor', { type: 'constructor' }],
    ['inherited toString', { type: 'toString' }],
    ['inherited __proto__', { type: '__proto__' }],
    ['inherited hasOwnProperty', { type: 'hasOwnProperty' }],
  ])('leaves state untouched for %s', (_name, action) => {
    const state = { value: 3, count: 2 }
    const next = counterReducer(state, action)
    expect(next).toBe(state)
    expect(next.count).toBe(2)
    expect(next.value).toBe(3)
  })

  it('never decrements count across a sequence of actions', () => {
    let state = INITIAL_STATE
    let previous = state.count
    for (const type of ['DECREMENT', 'RESET', 'DOUBLE', 'NOPE', 'ADD_FOUR', 'constructor', 'INCREMENT']) {
      state = counterReducer(state, { type })
      expect(state.count).toBeGreaterThanOrEqual(previous)
      previous = state.count
    }
    expect(state.count).toBe(5)
  })
})

describe('valueTone', () => {
  it.each([
    [-1, 'low'],
    [0, 'neutral'],
    [10, 'neutral'],
    [11, 'high'],
  ])('tone of %i is %s', (value, tone) => {
    expect(valueTone(value)).toBe(tone)
  })
})
