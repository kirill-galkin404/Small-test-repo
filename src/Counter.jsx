import { useReducer } from 'react'
import { counterReducer } from './counterReducer.js'
import { displayColor } from './displayColor.js'

const initialState = { value: 0, clicks: 0 }

export function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  // Event delegation on the container, mirroring counter.js's original
  // click handler: clicks that don't land on an element carrying a
  // data-action attribute do nothing at all (R-0003).
  function handleClick(event) {
    const action = event.target.dataset.action
    if (!action) {
      return
    }
    dispatch({ type: action })
  }

  return (
    <div id="counter" onClick={handleClick}>
      <h1 id="ttl">Counter ({state.clicks} clicks)</h1>
      <p id="d" className={`value value--${displayColor(state.value)}`}>
        {state.value}
      </p>
      <button data-action="INCREMENT">+</button>
      <button data-action="DECREMENT">-</button>
      <button data-action="RESET">reset</button>
      <button data-action="ADD_FOUR">+4</button>
      <button data-action="DOUBLE">x2</button>
    </div>
  )
}
