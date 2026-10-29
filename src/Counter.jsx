import { useReducer } from 'react'
import { ACTION, counterReducer, initialState } from './counterReducer'

const BUTTONS = [
  { action: ACTION.INCREMENT, label: '+' },
  { action: ACTION.DECREMENT, label: '-' },
  { action: ACTION.RESET, label: 'reset' },
  { action: ACTION.ADD_FOUR, label: '+4' },
  { action: ACTION.DOUBLE, label: 'x2' },
]

function valueColor(c) {
  if (c > 10) return 'red'
  if (c < 0) return 'blue'
  return 'black'
}

export default function Counter() {
  const [{ c, cc }, dispatch] = useReducer(counterReducer, initialState)

  return (
    <div id="counter">
      <h1 id="ttl">{cc === 0 ? 'Counter' : `Counter (${cc} clicks)`}</h1>
      <p id="d" style={{ color: valueColor(c) }}>{c}</p>
      {BUTTONS.map(({ action, label }) => (
        <button key={action} data-action={action} onClick={() => dispatch(action)}>
          {label}
        </button>
      ))}
    </div>
  )
}
