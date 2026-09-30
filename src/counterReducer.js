// State shape: { value: number, clicks: number }
//   - value:  the counter's numeric value (equivalent to `c` in counter.js)
//   - clicks: count of every successfully matched/dispatched action
//             (equivalent to `cc` in counter.js), per RULES.md R-0001/R-0002.
//
// Action shape: { type: "INCREMENT" | "DECREMENT" | "RESET" | "ADD_FOUR" | "DOUBLE" }
//
// Behavior mirrors counter.js's dispatch() exactly:
//   INCREMENT -> value += 1
//   DECREMENT -> value -= 1 (no lower bound)
//   RESET     -> value = 0
//   ADD_FOUR  -> value += 4
//   DOUBLE    -> value *= 2
// Every matched action also increments `clicks` as part of the same update.
// An unrecognized action.type returns the SAME state reference unchanged,
// without incrementing `clicks` (R-0002).
export function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { value: state.value + 1, clicks: state.clicks + 1 };
    case "DECREMENT":
      return { value: state.value - 1, clicks: state.clicks + 1 };
    case "RESET":
      return { value: 0, clicks: state.clicks + 1 };
    case "ADD_FOUR":
      return { value: state.value + 4, clicks: state.clicks + 1 };
    case "DOUBLE":
      return { value: state.value * 2, clicks: state.clicks + 1 };
    default:
      return state;
  }
}
