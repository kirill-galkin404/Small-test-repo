import { useReducer } from 'react';
import { ACTION, counterReducer, initialState } from './counterReducer';

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  const color = state.c > 10 ? 'red' : state.c < 0 ? 'blue' : 'black';

  return (
    <div id="counter">
      <h1 id="ttl">Counter ({state.cc} clicks)</h1>
      <p id="d" style={{ color }}>{state.c}</p>
      <button data-action="INCREMENT" onClick={() => dispatch({ type: ACTION.INCREMENT })}>
        Increment
      </button>
      <button data-action="DECREMENT" onClick={() => dispatch({ type: ACTION.DECREMENT })}>
        Decrement
      </button>
      <button data-action="RESET" onClick={() => dispatch({ type: ACTION.RESET })}>
        Reset
      </button>
      <button data-action="ADD_FOUR" onClick={() => dispatch({ type: ACTION.ADD_FOUR })}>
        Add Four
      </button>
      <button data-action="DOUBLE" onClick={() => dispatch({ type: ACTION.DOUBLE })}>
        Double
      </button>
    </div>
  );
}

export default Counter;
