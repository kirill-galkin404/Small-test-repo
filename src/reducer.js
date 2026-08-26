export const ACTION = Object.freeze({
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  RESET: "RESET",
  ADD_FOUR: "ADD_FOUR",
  DOUBLE: "DOUBLE",
});

export function reducer(state, action) {
  const { c, cc } = state;

  switch (action) {
    case ACTION.INCREMENT:
      return { c: c + 1, cc: cc + 1 };
    case ACTION.DECREMENT:
      return { c: c - 1, cc: cc + 1 };
    case ACTION.RESET:
      return { c: 0, cc: cc + 1 };
    case ACTION.ADD_FOUR:
      return { c: c + 4, cc: cc + 1 };
    case ACTION.DOUBLE:
      return { c: c * 2, cc: cc + 1 };
    default:
      console.warn("dispatch: unrecognized action", action);
      return state;
  }
}

export function colourFor(c) {
  if (c > 10) return "red";
  if (c < 0) return "blue";
  return "black";
}
