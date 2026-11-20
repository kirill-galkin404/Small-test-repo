export const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 })

export const initialState = Object.freeze({ value: 0, cc: 0 })

// cc counts every recognised action (including RESET) and is never reset.
export function reducer(state, action) {
  let value
  switch (action.type) {
    case ACTION.INCREMENT:
      value = state.value + 1
      break
    case ACTION.DECREMENT:
      value = state.value - 1
      break
    case ACTION.RESET:
      value = 0
      break
    case ACTION.ADD_FOUR:
      value = state.value + 4
      break
    case ACTION.DOUBLE:
      value = state.value * 2
      break
    default:
      console.warn('dispatch: unrecognized action', action.type)
      return state
  }
  return { value, cc: state.cc + 1 }
}

export function colorFor(value) {
  if (value > 10) return 'red'
  if (value < 0) return 'blue'
  return 'black'
}

export function titleFor(cc) {
  return cc === 0 ? 'Counter' : `Counter (${cc} clicks)`
}
