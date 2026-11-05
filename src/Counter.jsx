import { useReducer } from 'react';
import { counterReducer, initialState, ACTION } from './counterReducer.js';

const BUTTONS = [
  [ACTION.INCREMENT, '+'],
  [ACTION.DECREMENT, '-'],
  [ACTION.RESET, 'reset'],
  [ACTION.ADD_FOUR, '+4'],
  [ACTION.DOUBLE, 'x2'],
];

function valueColor(value) {
  if (value > 10) return 'red';
  if (value < 0) return 'blue';
  return 'black';
}

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  const title = state.clicks === 0 ? 'Counter' : `Counter (${state.clicks} clicks)`;

  return (
    <div id="counter">
      <h1 id="ttl">{title}</h1>
      <p id="d" style={{ color: valueColor(state.value) }}>{state.value}</p>
      {BUTTONS.map(([type, label]) => (
        <button key={type} data-action={type} onClick={() => dispatch({ type })}>
          {label}
        </button>
      ))}
    </div>
  );
}

export { Counter };
