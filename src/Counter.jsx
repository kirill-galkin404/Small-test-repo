import { useReducer } from "react";
import { reducer, colourFor } from "./reducer.js";

const initialState = { c: 0, cc: 0 };

export default function Counter() {
  const [{ c, cc }, dispatch] = useReducer(reducer, initialState);

  return (
    <div id="counter">
      <h1 id="ttl">{cc === 0 ? "Counter" : `Counter (${cc} clicks)`}</h1>
      <p id="d" style={{ color: colourFor(c) }}>
        {c}
      </p>
      <button data-action="INCREMENT" onClick={() => dispatch("INCREMENT")}>
        +
      </button>
      <button data-action="DECREMENT" onClick={() => dispatch("DECREMENT")}>
        -
      </button>
      <button data-action="RESET" onClick={() => dispatch("RESET")}>
        reset
      </button>
      <button data-action="ADD_FOUR" onClick={() => dispatch("ADD_FOUR")}>
        +4
      </button>
      <button data-action="DOUBLE" onClick={() => dispatch("DOUBLE")}>
        x2
      </button>
    </div>
  );
}
