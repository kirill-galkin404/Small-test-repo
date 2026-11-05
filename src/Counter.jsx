import { useReducer } from 'react';
import { ACTION, initialState, counterReducer } from './counterReducer.js';
import { valueColor } from './valueColor.js';

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div id="counter">
      <h1 id="ttl">{state.clicks === 0 ? 'Counter' : `Counter (${state.clicks} clicks)`}</h1>
      <p id="d" style={{ color: valueColor(state.value) }}>{state.value}</p>
      <button className="btn-increment" onClick={() => dispatch(ACTION.INCREMENT)}>+</button>
      <button className="btn-decrement" onClick={() => dispatch(ACTION.DECREMENT)}>-</button>
      <button className="btn-reset" onClick={() => dispatch(ACTION.RESET)}>reset</button>
      <button className="btn-add-four" onClick={() => dispatch(ACTION.ADD_FOUR)}>+4</button>
      <button className="btn-double" onClick={() => dispatch(ACTION.DOUBLE)}>x2</button>
    </div>
  );
}
