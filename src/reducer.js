// Pure counter reducer.
//
// State shape:   { value: number, clicks: number }
// Action shape:  { type: 'INCREMENT' | 'DECREMENT' | 'RESET' | 'ADD_FOUR' | 'DOUBLE' }
//
// `clicks` counts every successfully recognized (dispatched) action and is
// intended for display (e.g. in the page title). Unrecognized actions leave
// state completely unchanged, including `clicks`.
//
// This module has no side effects: it does not touch the DOM, console, or
// any external state. It is designed to be used with React's `useReducer`.

export const ACTIONS = Object.freeze({
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  RESET: "RESET",
  ADD_FOUR: "ADD_FOUR",
  DOUBLE: "DOUBLE",
});

export function reducer(state, action) {
  switch (action && action.type) {
    case ACTIONS.INCREMENT:
      return { value: state.value + 1, clicks: state.clicks + 1 };
    case ACTIONS.DECREMENT:
      return { value: state.value - 1, clicks: state.clicks + 1 };
    case ACTIONS.RESET:
      return { value: 0, clicks: state.clicks + 1 };
    case ACTIONS.ADD_FOUR:
      return { value: state.value + 4, clicks: state.clicks + 1 };
    case ACTIONS.DOUBLE:
      return { value: state.value * 2, clicks: state.clicks + 1 };
    default:
      return state;
  }
}
