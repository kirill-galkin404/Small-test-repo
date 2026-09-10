export const ACTION = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
})

export const initialState = { c: 0, cc: 0 }

export function counterReducer(state, action) {
  const { c, cc } = state

  switch (action) {
    case ACTION.INCREMENT:
      return { c: c + 1, cc: cc + 1 }
    case ACTION.DECREMENT:
      return { c: c - 1, cc: cc + 1 }
    case ACTION.RESET:
      return { c: 0, cc: cc + 1 }
    case ACTION.ADD_FOUR:
      return { c: c + 4, cc: cc + 1 }
    case ACTION.DOUBLE:
      return { c: c * 2, cc: cc + 1 }
    default:
      return state
  }
}
