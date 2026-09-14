import { useEffect, useReducer } from "react";
import { counterReducer, initialState } from "../state/counterReducer";
import { getTitle, getColor } from "../state/display";
import ActionButton from "./ActionButton";

const BUTTONS = [
  { action: "INCREMENT", label: "+" },
  { action: "DECREMENT", label: "-" },
  { action: "RESET", label: "reset" },
  { action: "ADD_FOUR", label: "+4" },
  { action: "DOUBLE", label: "x2" },
];

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  const title = getTitle(state.clickCount);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div id="counter">
      <h1 id="ttl">{title}</h1>
      <p id="d" style={{ color: getColor(state.value) }}>
        {state.value}
      </p>
      {BUTTONS.map(({ action, label }) => (
        <ActionButton
          key={action}
          action={action}
          label={label}
          onClick={() => dispatch({ type: action })}
        />
      ))}
    </div>
  );
}
