import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Counter from './Counter.jsx'

function clickButton(name) {
  fireEvent.click(screen.getByRole('button', { name }))
}

describe('Counter', () => {
  it('shows red text once c exceeds 10 via DOUBLE then INCREMENT from c=6', () => {
    render(<Counter />)

    for (let i = 0; i < 6; i++) clickButton('+') // c: 0 -> 6
    clickButton('x2') // c: 6 -> 12
    clickButton('+') // c: 12 -> 13

    const display = screen.getByText('13')
    expect(display).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('shows blue text after a DECREMENT from c=0', () => {
    render(<Counter />)

    clickButton('-') // c: 0 -> -1

    const display = screen.getByText('-1')
    expect(display).toHaveStyle({ color: 'rgb(0, 0, 255)' })
  })

  it('shows black text (not blue) after RESET brings c to exactly 0', () => {
    render(<Counter />)

    clickButton('+') // c: 0 -> 1
    clickButton('reset') // c: 1 -> 0

    const display = screen.getByText('0')
    expect(display).toHaveStyle({ color: 'rgb(0, 0, 0)' })
  })

  it('shows black text (not red) after two ADD_FOUR actions bring c to exactly 10', () => {
    render(<Counter />)

    clickButton('+') // c: 0 -> 1
    clickButton('+') // c: 1 -> 2
    clickButton('+4') // c: 2 -> 6
    clickButton('+4') // c: 6 -> 10

    const display = screen.getByText('10')
    expect(display).toHaveStyle({ color: 'rgb(0, 0, 0)' })
  })

  it('matches the legacy render() contract for display text and title across all five actions', () => {
    render(<Counter />)

    // Exercise every action at least once and track expected state exactly
    // the way counter.js's dispatch()/render() would.
    let c = 0
    let cc = 0

    clickButton('+') // INCREMENT
    c = c + 1
    cc++

    clickButton('-') // DECREMENT
    c = c - 1
    cc++

    clickButton('+4') // ADD_FOUR
    c = c + 4
    cc++

    clickButton('x2') // DOUBLE
    c = c * 2
    cc++

    clickButton('reset') // RESET
    c = 0
    cc++

    expect(screen.getByText(String(c))).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: `Counter (${cc} clicks)` }),
    ).toBeInTheDocument()
    expect(cc).toBe(5)
  })
})
