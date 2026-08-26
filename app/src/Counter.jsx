import { useReducer } from 'react'
import { ACTION, counterReducer } from './counterReducer.js'
import './Counter.css'

const initialState = { c: 0, cc: 0 }

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  const color = state.c > 10 ? 'red' : state.c < 0 ? 'blue' : 'black'

  return (
    <div id="counter">
      <h1 id="ttl">Counter ({state.cc} clicks)</h1>
      <p id="d" className="display" style={{ color }}>
        {state.c}
      </p>
      <button
        className="increment"
        onClick={() => dispatch({ type: ACTION.INCREMENT })}
      >
        +
      </button>
      <button
        className="decrement"
        onClick={() => dispatch({ type: ACTION.DECREMENT })}
      >
        -
      </button>
      <button
        className="reset"
        onClick={() => dispatch({ type: ACTION.RESET })}
      >
        reset
      </button>
      <button onClick={() => dispatch({ type: ACTION.ADD_FOUR })}>+4</button>
      <button onClick={() => dispatch({ type: ACTION.DOUBLE })}>x2</button>
    </div>
  )
}

export default Counter
