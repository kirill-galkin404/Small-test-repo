import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ACTION, initialState, reducer, colorFor, titleFor } from './counterModel.js'

const run = (state, ...types) => types.reduce((s, type) => reducer(s, { type }), state)

test('ACTION values are fixed and frozen', () => {
  assert.deepEqual({ ...ACTION }, { INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 })
  assert.ok(Object.isFrozen(ACTION))
})

test('initial state is 0 value, 0 clicks', () => {
  assert.equal(initialState.value, 0)
  assert.equal(initialState.cc, 0)
})

test('each action applies its delta', () => {
  assert.equal(run(initialState, ACTION.INCREMENT).value, 1)
  assert.equal(run(initialState, ACTION.DECREMENT).value, -1)
  assert.equal(run({ value: 7, cc: 3 }, ACTION.RESET).value, 0)
  assert.equal(run(initialState, ACTION.ADD_FOUR).value, 4)
  assert.equal(run({ value: 3, cc: 0 }, ACTION.DOUBLE).value, 6)
})

test('no bounds: negatives and large values allowed', () => {
  assert.equal(run(initialState, ACTION.DECREMENT, ACTION.DECREMENT).value, -2)
  assert.equal(run({ value: -3, cc: 0 }, ACTION.DOUBLE).value, -6)
  assert.equal(run({ value: 1000, cc: 0 }, ACTION.ADD_FOUR).value, 1004)
})

test('every recognised action, including RESET, increments cc; cc is never reset', () => {
  const s = run(initialState, ACTION.INCREMENT, ACTION.RESET, ACTION.DOUBLE, ACTION.DECREMENT, ACTION.ADD_FOUR)
  assert.equal(s.cc, 5)
  assert.equal(run(s, ACTION.RESET).cc, 6)
})

test('reducer does not mutate its input', () => {
  const s = { value: 1, cc: 1 }
  reducer(s, { type: ACTION.INCREMENT })
  assert.deepEqual(s, { value: 1, cc: 1 })
})

test('unknown action warns and returns the identical state', (t) => {
  const warn = t.mock.method(console, 'warn', () => {})
  const s = { value: 5, cc: 2 }
  assert.equal(reducer(s, { type: 99 }), s)
  assert.equal(reducer(s, { type: undefined }), s)
  assert.equal(warn.mock.callCount(), 2)
})

test('colorFor thresholds', () => {
  assert.equal(colorFor(11), 'red')
  assert.equal(colorFor(10), 'black')
  assert.equal(colorFor(0), 'black')
  assert.equal(colorFor(-1), 'blue')
  assert.equal(colorFor(100), 'red')
  assert.equal(colorFor(-100), 'blue')
})

test('titleFor', () => {
  assert.equal(titleFor(0), 'Counter')
  assert.equal(titleFor(1), 'Counter (1 clicks)')
  assert.equal(titleFor(12), 'Counter (12 clicks)')
})
