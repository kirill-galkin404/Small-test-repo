import { useReducer } from 'react';
import { ACTION, initialState, reducer } from './counterReducer.js';

function colorFor(value) {
  if (value > 10) return 'red';
  if (value < 0) return 'blue';
  return 'black';
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const title = state.clicks === 0 ? 'Counter' : `Counter (${state.clicks} clicks)`;

  return (
    <div id="counter">
      <h1 id="ttl">{title}</h1>
      <p id="d" style={{ color: colorFor(state.value) }}>{state.value}</p>
      <button data-action="INCREMENT" onClick={() => dispatch({ type: ACTION.INCREMENT })}>+</button>
      <button data-action="DECREMENT" onClick={() => dispatch({ type: ACTION.DECREMENT })}>-</button>
      <button data-action="RESET" onClick={() => dispatch({ type: ACTION.RESET })}>reset</button>
      <button data-action="ADD_FOUR" onClick={() => dispatch({ type: ACTION.ADD_FOUR })}>+4</button>
      <button data-action="DOUBLE" onClick={() => dispatch({ type: ACTION.DOUBLE })}>x2</button>
    </div>
  );
}
