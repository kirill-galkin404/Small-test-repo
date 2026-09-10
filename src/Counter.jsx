import { useReducer } from 'react'
import { ACTION, initialState, counterReducer } from './counterReducer.js'
import './Counter.css'

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState)
  const { c, cc } = state

  let color = 'black'
  if (c > 10) {
    color = 'red'
  } else if (c < 0) {
    color = 'blue'
  }

  return (
    <div id="counter">
      <h1 id="ttl">{cc === 0 ? 'Counter' : `Counter (${cc} clicks)`}</h1>
      <p id="d" style={{ color }}>{c}</p>
      <button data-action="INCREMENT" onClick={() => dispatch(ACTION.INCREMENT)}>+</button>
      <button data-action="DECREMENT" onClick={() => dispatch(ACTION.DECREMENT)}>-</button>
      <button data-action="RESET" onClick={() => dispatch(ACTION.RESET)}>reset</button>
      <button data-action="ADD_FOUR" onClick={() => dispatch(ACTION.ADD_FOUR)}>+4</button>
      <button data-action="DOUBLE" onClick={() => dispatch(ACTION.DOUBLE)}>x2</button>
    </div>
  )
}
