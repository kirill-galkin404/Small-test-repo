import { useEffect, useReducer } from 'react'
import { counterReducer, INITIAL_STATE, valueTone } from './counterReducer.js'

const BUTTONS = [
  { action: 'INCREMENT', label: '+' },
  { action: 'DECREMENT', label: '-' },
  { action: 'RESET', label: 'reset' },
  { action: 'ADD_FOUR', label: '+4' },
  { action: 'DOUBLE', label: 'x2' },
]

export function counterTitle(count) {
  return `Counter (${count} ${count === 1 ? 'click' : 'clicks'})`
}

export default function Counter() {
  const [state, dispatch] = useReducer(counterReducer, INITIAL_STATE)
  const title = counterTitle(state.count)

  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <section className="counter">
      <h1 className="counter__title">{title}</h1>
      <p
        className={`value value--${valueTone(state.value)}`}
        data-testid="value"
      >
        {state.value}
      </p>
      <div className="counter__buttons">
        {BUTTONS.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            data-action={action}
            onClick={() => dispatch({ type: action })}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
