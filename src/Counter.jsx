import { useReducer } from 'react'
import { ACTION, initialState, reducer, colorFor, titleFor } from './counterModel.js'

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div id="counter">
      <h1 id="ttl">{titleFor(state.cc)}</h1>
      <p id="d" style={{ color: colorFor(state.value) }}>{state.value}</p>
      <button
        data-action="INCREMENT"
        onClick={() => dispatch({ type: ACTION.INCREMENT })}
      >+</button>
      <button
        data-action="DECREMENT"
        onClick={() => dispatch({ type: ACTION.DECREMENT })}
      >-</button>
      <button
        data-action="RESET"
        onClick={() => dispatch({ type: ACTION.RESET })}
      >reset</button>
      <button
        data-action="ADD_FOUR"
        onClick={() => dispatch({ type: ACTION.ADD_FOUR })}
      >+4</button>
      <button
        data-action="DOUBLE"
        onClick={() => dispatch({ type: ACTION.DOUBLE })}
      >x2</button>
    </div>
  )
}
