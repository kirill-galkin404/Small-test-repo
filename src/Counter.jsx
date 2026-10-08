import { useReducer } from 'react'
import { ACTIONS, initialState, reducer, valueTone, clickLabel } from './logic.js'

const BUTTONS = [
  { type: ACTIONS.INCREMENT, label: '+', variant: 'increment' },
  { type: ACTIONS.DECREMENT, label: '-', variant: 'decrement' },
  { type: ACTIONS.RESET, label: 'reset', variant: 'reset' },
  { type: ACTIONS.ADD_FOUR, label: '+4', variant: 'add-four' },
  { type: ACTIONS.DOUBLE, label: 'x2', variant: 'double' },
]

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div id="counter">
      <h1>{`Counter (${clickLabel(state.count)})`}</h1>
      <p data-testid="value" className={`value value--${valueTone(state.value)}`}>
        {state.value}
      </p>
      {BUTTONS.map(({ type, label, variant }) => (
        <button
          key={type}
          type="button"
          className={`btn btn--${variant}`}
          onClick={() => dispatch({ type })}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
