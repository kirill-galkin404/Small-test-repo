import { useReducer } from 'react'
import {
  ACTIONS,
  counterReducer,
  headingFor,
  initialState,
  toneFor,
} from './counterReducer.js'

const BUTTONS = [
  ['btn--increment', ACTIONS.INCREMENT, '+'],
  ['btn--decrement', ACTIONS.DECREMENT, '-'],
  ['btn--reset', ACTIONS.RESET, 'reset'],
  ['btn--add-four', ACTIONS.ADD_FOUR, '+4'],
  ['btn--double', ACTIONS.DOUBLE, 'x2'],
]

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  return (
    <div className="counter">
      <h1 className="counter__title">{headingFor(state.clicks)}</h1>
      <p
        className={`counter__value counter__value--${toneFor(state.value)}`}
        data-testid="value"
      >
        {state.value}
      </p>
      {BUTTONS.map(([cls, type, label]) => (
        <button
          key={type}
          type="button"
          className={`btn ${cls}`}
          onClick={() => dispatch({ type })}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
