import { useReducer } from 'react'
import { dispatch as dispatchRule, ACTION } from '../rules/dispatch.js'
import { colorForValue } from '../rules/color.js'
import styles from './Counter.module.css'

const BUTTONS = [
  { action: 'INCREMENT', label: '+', accessibleName: 'Increment counter by 1', className: 'buttonIncrement' },
  { action: 'DECREMENT', label: '-', accessibleName: 'Decrement counter by 1', className: 'buttonDecrement' },
  { action: 'RESET', label: 'reset', accessibleName: 'Reset counter to 0', className: 'buttonReset' },
  { action: 'ADD_FOUR', label: '+4', accessibleName: 'Add 4 to counter', className: 'buttonAddFour' },
  { action: 'DOUBLE', label: 'x2', accessibleName: 'Double the counter', className: 'buttonDouble' },
]

const initialState = { c: 0, cc: 0 }

function reducer(state, actionCode) {
  return dispatchRule(state, actionCode)
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const color = colorForValue(state.c)

  return (
    <div className={styles.counter} id="counter">
      <h1 id="ttl" className={styles.title}>
        Counter ({state.cc} actions)
      </h1>
      <p
        id="d"
        className={styles.value}
        style={{ color }}
        aria-live="polite"
      >
        {state.c}
      </p>
      <div className={styles.buttons}>
        {BUTTONS.map(({ action, label, accessibleName, className }) => (
          <button
            key={action}
            type="button"
            data-action={action}
            aria-label={accessibleName}
            className={`${styles.button} ${styles[className]}`}
            onClick={() => dispatch(ACTION[action])}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
