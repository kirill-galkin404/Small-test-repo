import { useReducer } from 'react';
import { reducer, initialState, colorFor, titleFor } from './rules.js';
import { useTheme } from './theme.js';

const BUTTONS = [
  ['INCREMENT', '+'],
  ['DECREMENT', '-'],
  ['RESET', 'reset'],
  ['ADD_FOUR', '+4'],
  ['DOUBLE', 'x2'],
];

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [theme, toggleTheme] = useTheme();

  return (
    <div id="counter" className="counter">
      <h1 id="ttl">{titleFor(state.count)}</h1>
      <p id="d" className={`value value--${colorFor(state.value)}`}>
        {state.value}
      </p>
      {BUTTONS.map(([type, label]) => (
        <button
          key={type}
          type="button"
          data-action={type}
          className={`btn btn--${type}`}
          onClick={() => dispatch({ type })}
        >
          {label}
        </button>
      ))}
      <div>
        <button type="button" className="theme-toggle" aria-label="Toggle theme" onClick={toggleTheme}>
          {theme}
        </button>
      </div>
    </div>
  );
}
