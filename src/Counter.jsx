import { useReducer } from 'react';
import { ACTION, counterReducer, initialState } from './counterReducer.js';

const BUTTONS = [
  { action: 'INCREMENT', label: '+' },
  { action: 'DECREMENT', label: '-' },
  { action: 'RESET', label: 'reset' },
  { action: 'ADD_FOUR', label: '+4' },
  { action: 'DOUBLE', label: 'x2' },
];

// Maps an action name to its reducer action; unknown names warn and dispatch nothing.
export function dispatchByName(dispatch, name) {
  const type = ACTION[name];
  if (type === undefined) {
    console.warn('dispatch: unrecognized action', name);
    return;
  }
  dispatch({ type });
}

function colorFor(c) {
  if (c > 10) return 'red';
  if (c < 0) return 'blue';
  return 'black';
}

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  const title = state.cc === 0 ? 'Counter' : `Counter (${state.cc} clicks)`;

  return (
    <div id="counter">
      <h1 id="ttl">{title}</h1>
      <p id="d" style={{ color: colorFor(state.c) }}>{state.c}</p>
      {BUTTONS.map(({ action, label }) => (
        <button key={action} data-action={action} onClick={() => dispatchByName(dispatch, action)}>
          {label}
        </button>
      ))}
    </div>
  );
}
