import { useReducer } from 'react';
import { ACTION, initialState, counterReducer, toneFor } from './counterReducer.js';

const BUTTONS = [
  [ACTION.INCREMENT, '+'],
  [ACTION.DECREMENT, '-'],
  [ACTION.RESET, 'reset'],
  [ACTION.ADD_FOUR, '+4'],
  [ACTION.DOUBLE, 'x2'],
];

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div id="counter">
      <h1 id="ttl">Counter ({state.clicks} clicks)</h1>
      <p id="d" data-tone={toneFor(state.value)}>{state.value}</p>
      {BUTTONS.map(([action, label]) => (
        <button key={action} data-action={action} onClick={() => dispatch(action)}>
          {label}
        </button>
      ))}
    </div>
  );
}
