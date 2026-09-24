import { useReducer, useState, useEffect } from 'react';
import { ACTION } from './actions.js';
import { counterReducer } from './reducer.js';

/**
 * The 5 buttons, each pairing the dispatched ACTION value with the string
 * name used for the `data-action` attribute (kept for test targeting, per
 * RULES.md §4 guard path 1's original `dataset.action` mechanism).
 */
const BUTTONS = [
  { action: ACTION.INCREMENT, name: 'INCREMENT', label: '+1' },
  { action: ACTION.DECREMENT, name: 'DECREMENT', label: '-1' },
  { action: ACTION.RESET, name: 'RESET', label: 'Reset' },
  { action: ACTION.ADD_FOUR, name: 'ADD_FOUR', label: '+4' },
  { action: ACTION.DOUBLE, name: 'DOUBLE', label: 'x2' },
];

/**
 * Derives the colour band from `c` alone, per RULES.md §5.1:
 * red when c>10, blue when c<0, black for 0-10 inclusive.
 *
 * @param {number} c
 * @returns {'red' | 'blue' | 'black'}
 */
function colorStateFor(c) {
  if (c > 10) return 'red';
  if (c < 0) return 'blue';
  return 'black';
}

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { c: 0, cc: 0 });
  const [theme, setTheme] = useState(null);
  const colorState = colorStateFor(state.c);

  useEffect(() => {
    if (theme === null) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <div id="counter">
      <h1 id="ttl">{`Counter (${state.cc} clicks)`}</h1>
      <div
        id="d"
        data-color-state={colorState}
        className={`counter-display counter-display--${colorState}`}
      >
        {state.c}
      </div>
      {BUTTONS.map(({ action, name, label }) => (
        <button
          key={name}
          type="button"
          data-action={name}
          onClick={() => dispatch(action)}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      >
        Toggle theme
      </button>
    </div>
  );
}
