import { useReducer } from 'react';
import { ACTION, initialState, reducer } from './reducer.js';

const BUTTONS = [
  { name: 'INCREMENT', label: '+' },
  { name: 'DECREMENT', label: '-' },
  { name: 'RESET', label: 'reset' },
  { name: 'ADD_FOUR', label: '+4' },
  { name: 'DOUBLE', label: 'x2' },
];

function colorFor(value) {
  if (value > 10) return 'red';
  if (value < 0) return 'blue';
  return 'black';
}

export default function Counter() {
  const [{ value, clicks }, dispatch] = useReducer(reducer, initialState);
  const title = clicks === 0 ? 'Counter' : `Counter (${clicks} clicks)`;

  return (
    <div id="counter">
      <h1 id="ttl">{title}</h1>
      <p id="d" style={{ color: colorFor(value) }}>{value}</p>
      {BUTTONS.map(({ name, label }) => (
        <button key={name} data-action={name} onClick={() => dispatch(ACTION[name])}>
          {label}
        </button>
      ))}
    </div>
  );
}
