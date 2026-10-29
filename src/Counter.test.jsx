import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './Counter'

const click = (label) => fireEvent.click(screen.getByRole('button', { name: label }))
const heading = () => document.getElementById('ttl')
const value = () => document.getElementById('d')

describe('Counter', () => {
  it('renders the initial state', () => {
    render(<Counter />)
    expect(heading().tagName).toBe('H1')
    expect(heading()).toHaveTextContent(/^Counter$/)
    expect(value().tagName).toBe('P')
    expect(value()).toHaveTextContent(/^0$/)
    expect(value().style.color).toBe('black')
  })

  it('renders five buttons with the original data-action values', () => {
    render(<Counter />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => [b.textContent, b.dataset.action])).toEqual([
      ['+', 'INCREMENT'],
      ['-', 'DECREMENT'],
      ['reset', 'RESET'],
      ['+4', 'ADD_FOUR'],
      ['x2', 'DOUBLE'],
    ])
  })

  it('updates value and heading after a recognized action', () => {
    render(<Counter />)
    click('+')
    expect(value()).toHaveTextContent(/^1$/)
    expect(heading()).toHaveTextContent(/^Counter \(1 clicks\)$/)
  })

  it('handles sequences such as +4, x2, reset', () => {
    render(<Counter />)
    click('+4')
    click('x2')
    expect(value()).toHaveTextContent(/^8$/)
    expect(heading()).toHaveTextContent('Counter (2 clicks)')
    click('reset')
    expect(value()).toHaveTextContent(/^0$/)
    expect(heading()).toHaveTextContent('Counter (3 clicks)')
  })

  it('decrements below zero', () => {
    render(<Counter />)
    click('-')
    expect(value()).toHaveTextContent(/^-1$/)
  })

  it('colors the value red above 10, blue below 0, black otherwise', () => {
    render(<Counter />)
    click('-')
    expect(value().style.color).toBe('blue')
    click('reset')
    expect(value().style.color).toBe('black')
    click('+4')
    click('+4')
    click('+')
    click('+')
    expect(value()).toHaveTextContent(/^10$/)
    expect(value().style.color).toBe('black')
    click('+')
    expect(value()).toHaveTextContent(/^11$/)
    expect(value().style.color).toBe('red')
  })

  it('ignores clicks off the buttons', () => {
    render(<Counter />)
    click('+')
    fireEvent.click(heading())
    fireEvent.click(value())
    fireEvent.click(document.getElementById('counter'))
    expect(value()).toHaveTextContent(/^1$/)
    expect(heading()).toHaveTextContent('Counter (1 clicks)')
  })
})
