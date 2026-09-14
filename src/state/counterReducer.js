export const initialState = { value: 0, clickCount: 0 };

export function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { value: state.value + 1, clickCount: state.clickCount + 1 };
    case "DECREMENT":
      return { value: state.value - 1, clickCount: state.clickCount + 1 };
    case "RESET":
      return { value: 0, clickCount: state.clickCount + 1 };
    case "ADD_FOUR":
      return { value: state.value + 4, clickCount: state.clickCount + 1 };
    case "DOUBLE":
      return { value: state.value * 2, clickCount: state.clickCount + 1 };
    default:
      console.warn("dispatch: unrecognized action", action.type);
      return state;
  }
}
