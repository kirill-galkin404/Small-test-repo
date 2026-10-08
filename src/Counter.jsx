import { useReducer } from 'react';
import './counter.css';
import {
  ACTION_TYPES,
  initialState,
  counterReducer,
  valueTone,
  titleText,
} from './counterRules.js';

export function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div>
      <h1>{titleText(state.cc)}</h1>
      <div id="d" data-testid="value" className={`value--${valueTone(state.c)}`}>
        {state.c}
      </div>
      <button type="button" className="btn-increment" onClick={() => dispatch({ type: ACTION_TYPES.INCREMENT })}>
        +
      </button>
      <button type="button" className="btn-decrement" onClick={() => dispatch({ type: ACTION_TYPES.DECREMENT })}>
        -
      </button>
      <button type="button" className="btn-reset" onClick={() => dispatch({ type: ACTION_TYPES.RESET })}>
        reset
      </button>
      <button type="button" className="btn-add-four" onClick={() => dispatch({ type: ACTION_TYPES.ADD_FOUR })}>
        +4
      </button>
      <button type="button" className="btn-double" onClick={() => dispatch({ type: ACTION_TYPES.DOUBLE })}>
        x2
      </button>
    </div>
  );
}

export default Counter;
