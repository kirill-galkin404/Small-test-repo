import { useReducer } from 'react';
import { ACTION, counterReducer, initialState } from './counterReducer';
import ActionButton from './ActionButton';

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  const color = state.c > 10 ? 'red' : state.c < 0 ? 'blue' : 'black';

  return (
    <div id="counter">
      <h1 id="ttl">Counter ({state.cc} clicks)</h1>
      <p id="d" style={{ color }}>{state.c}</p>
      <ActionButton action="INCREMENT" onClick={() => dispatch({ type: ACTION.INCREMENT })}>
        Increment
      </ActionButton>
      <ActionButton action="DECREMENT" onClick={() => dispatch({ type: ACTION.DECREMENT })}>
        Decrement
      </ActionButton>
      <ActionButton action="RESET" onClick={() => dispatch({ type: ACTION.RESET })}>
        Reset
      </ActionButton>
      <ActionButton action="ADD_FOUR" onClick={() => dispatch({ type: ACTION.ADD_FOUR })}>
        Add Four
      </ActionButton>
      <ActionButton action="DOUBLE" onClick={() => dispatch({ type: ACTION.DOUBLE })}>
        Double
      </ActionButton>
    </div>
  );
}

export default Counter;
