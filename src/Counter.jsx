import { useReducer } from 'react'
import { counterReducer } from './counterReducer.js'

const initialState = { value: 0, clickCount: 0 }

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  return (
    <div id="counter">
      <h1 id="ttl">Counter ({state.clickCount} clicks)</h1>
      <p id="d">{state.value}</p>
      <button data-action="INCREMENT" onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button data-action="DECREMENT" onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button data-action="RESET" onClick={() => dispatch({ type: 'RESET' })}>reset</button>
      <button data-action="ADD_FOUR" onClick={() => dispatch({ type: 'ADD_FOUR' })}>+4</button>
      <button data-action="DOUBLE" onClick={() => dispatch({ type: 'DOUBLE' })}>x2</button>
    </div>
  )
}
