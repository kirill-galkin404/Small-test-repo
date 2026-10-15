export const ACTIONS = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
})

export const initialState = { value: 0, clicks: 0 }

export function counterReducer(state, action) {
  const type = action?.type
  if (typeof type !== 'string' || !Object.hasOwn(ACTIONS, type)) {
    console.warn('dispatch: unrecognized action', type)
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
  }
  return { value, clicks: state.clicks + 1 }
}

export function toneFor(value) {
  if (value > 10) return 'high'
  if (value < 0) return 'negative'
  return 'default'
}

export function headingFor(clicks) {
  return clicks === 0 ? 'Counter' : `Counter (${clicks} clicks)`
}
