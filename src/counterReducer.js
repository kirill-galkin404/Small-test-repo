export function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, value: state.value + 1, clickCount: state.clickCount + 1 };
    case 'DECREMENT':
      return { ...state, value: state.value - 1, clickCount: state.clickCount + 1 };
    case 'RESET':
      return { ...state, value: 0, clickCount: state.clickCount + 1 };
    case 'ADD_FOUR':
      return { ...state, value: state.value + 4, clickCount: state.clickCount + 1 };
    case 'DOUBLE':
      return { ...state, value: state.value * 2, clickCount: state.clickCount + 1 };
    default:
      return state;
  }
}
