import { useReducer } from 'react';
import { reducer, ACTIONS } from './reducer.js';
import { formatDisplay, formatTitle } from './formatter.js';

const initialState = { value: 0, clicks: 0 };

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div id="counter">
      <h1 id="ttl">{formatTitle(state)}</h1>
      <p id="d" style={{ color: formatDisplay(state) }}>{state.value}</p>
      <button onClick={() => dispatch({ type: ACTIONS.INCREMENT })}>+</button>
      <button onClick={() => dispatch({ type: ACTIONS.DECREMENT })}>-</button>
      <button onClick={() => dispatch({ type: ACTIONS.RESET })}>reset</button>
      <button onClick={() => dispatch({ type: ACTIONS.ADD_FOUR })}>+4</button>
      <button onClick={() => dispatch({ type: ACTIONS.DOUBLE })}>x2</button>
    </div>
  );
}
