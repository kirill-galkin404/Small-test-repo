export const ACTION = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
})

export const initialState = Object.freeze({ c: 0, cc: 0 })

// c is the counter value; cc counts every recognized action (including RESET).
export function counterReducer(state, action) {
  let c
  switch (action) {
    case ACTION.INCREMENT:
      c = state.c + 1
      break
    case ACTION.DECREMENT:
      c = state.c - 1
      break
    case ACTION.RESET:
      c = 0
      break
    case ACTION.ADD_FOUR:
      c = state.c + 4
      break
    case ACTION.DOUBLE:
      c = state.c * 2
      break
    default:
      console.warn('dispatch: unrecognized action', action)
      return state
  }
  return { c, cc: state.cc + 1 }
}
