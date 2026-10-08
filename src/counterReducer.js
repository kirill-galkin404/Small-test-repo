export const INITIAL_STATE = Object.freeze({ value: 0, count: 0 })

const HANDLERS = Object.freeze({
  INCREMENT: (value) => value + 1,
  DECREMENT: (value) => value - 1,
  RESET: () => 0,
  ADD_FOUR: (value) => value + 4,
  DOUBLE: (value) => value * 2,
})

export function counterReducer(state, action) {
  const type = action && action.type
  if (typeof type !== 'string' || !Object.prototype.hasOwnProperty.call(HANDLERS, type)) {
    return state
  }
  return { value: HANDLERS[type](state.value), count: state.count + 1 }
}

export function valueTone(value) {
  if (value > 10) return 'high'
  if (value < 0) return 'low'
  return 'neutral'
}
