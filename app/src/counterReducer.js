export const ACTION = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  ADD_FOUR: 'ADD_FOUR',
  DOUBLE: 'DOUBLE',
})

export function counterReducer(state, action) {
  switch (action.type) {
    case ACTION.INCREMENT:
      return { c: state.c + 1, cc: state.cc + 1 }
    case ACTION.DECREMENT:
      return { c: state.c - 1, cc: state.cc + 1 }
    case ACTION.RESET:
      return { c: 0, cc: state.cc + 1 }
    case ACTION.ADD_FOUR:
      return { c: state.c + 4, cc: state.cc + 1 }
    case ACTION.DOUBLE:
      return { c: state.c * 2, cc: state.cc + 1 }
    default:
      console.warn('counterReducer: unrecognized action', action.type)
      return state
  }
}
