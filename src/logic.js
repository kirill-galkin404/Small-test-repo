// Pure counter logic. Unlike the legacy script, the reducer does not log or
// warn: unknown actions are silently ignored and per-dispatch logging is dropped.

export const ACTIONS = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
})

export const initialState = Object.freeze({ value: 0, count: 0 })

export function reducer(state, action) {
  const type = action && action.type
  if (typeof type !== 'string' || !Object.hasOwn(ACTIONS, type)) {
    return state
  }

  let value
  switch (type) {
    case ACTIONS.INCREMENT:
      value = state.value + 1
      break
    case ACTIONS.DECREMENT:
      value = state.value - 1
      break
    case ACTIONS.RESET:
      value = 0
      break
    case ACTIONS.ADD_FOUR:
      value = state.value + 4
      break
    case ACTIONS.DOUBLE:
      value = state.value * 2
      break
    default:
      return state
  }

  return { value, count: state.count + 1 }
}

export function valueTone(value) {
  if (value > 10) return 'high'
  if (value < 0) return 'low'
  return 'neutral'
}

export function clickLabel(count) {
  return count === 1 ? '1 click' : `${count} clicks`
}
