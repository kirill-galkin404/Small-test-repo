import { useReducer } from 'react';
import { ACTION, initialState, counterReducer } from './counterReducer.js';

const BUTTONS = [
  ['INCREMENT', '+'],
  ['DECREMENT', '-'],
  ['RESET', 'reset'],
  ['ADD_FOUR', '+4'],
  ['DOUBLE', 'x2'],
];

export function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  const { value, clickCount } = state;
  const color = value > 10 ? 'red' : value < 0 ? 'blue' : 'black';
  const title = clickCount === 0 ? 'Counter' : `Counter (${clickCount} clicks)`;

  return (
    <div id="counter">
      <h1 id="ttl">{title}</h1>
      <p id="d" style={{ color }}>{value}</p>
      {BUTTONS.map(([name, label]) => (
        <button
          key={name}
          data-action={name}
          onClick={() => dispatch({ type: ACTION[name] })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default Counter;
