import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Counter } from './Counter.jsx'

describe('Counter', () => {
  it('renders the expected ids and data-action attributes', () => {
    const { container } = render(<Counter />)

    expect(container.querySelector('#counter')).not.toBeNull()
    expect(container.querySelector('#ttl')).not.toBeNull()
    expect(container.querySelector('#d')).not.toBeNull()

    const actions = ['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE']
    for (const action of actions) {
      expect(container.querySelector(`[data-action="${action}"]`)).not.toBeNull()
    }
  })

  it('starts at value 0 and 0 clicks', () => {
    const { container } = render(<Counter />)
    expect(container.querySelector('#d').textContent).toBe('0')
    expect(container.querySelector('#ttl').textContent).toBe('Counter (0 clicks)')
    expect(container.querySelector('#d').className).toContain('neutral')
  })

  it('increments the value and click count on INCREMENT', () => {
    const { container } = render(<Counter />)
    fireEvent.click(container.querySelector('[data-action="INCREMENT"]'))
    expect(container.querySelector('#d').textContent).toBe('1')
    expect(container.querySelector('#ttl').textContent).toBe('Counter (1 clicks)')
  })

  it('decrements below zero and shows the negative class', () => {
    const { container } = render(<Counter />)
    fireEvent.click(container.querySelector('[data-action="DECREMENT"]'))
    expect(container.querySelector('#d').textContent).toBe('-1')
    expect(container.querySelector('#ttl').textContent).toBe('Counter (1 clicks)')
    expect(container.querySelector('#d').className).toContain('negative')
  })

  it('resets the value to 0 while still incrementing clicks', () => {
    const { container } = render(<Counter />)
    fireEvent.click(container.querySelector('[data-action="ADD_FOUR"]'))
    fireEvent.click(container.querySelector('[data-action="RESET"]'))
    expect(container.querySelector('#d').textContent).toBe('0')
    expect(container.querySelector('#ttl').textContent).toBe('Counter (2 clicks)')
  })

  it('adds four on ADD_FOUR', () => {
    const { container } = render(<Counter />)
    fireEvent.click(container.querySelector('[data-action="ADD_FOUR"]'))
    expect(container.querySelector('#d').textContent).toBe('4')
    expect(container.querySelector('#ttl').textContent).toBe('Counter (1 clicks)')
  })

  it('doubles the value on DOUBLE and shows positive-high class above 10', () => {
    const { container } = render(<Counter />)
    fireEvent.click(container.querySelector('[data-action="ADD_FOUR"]')) // 4
    fireEvent.click(container.querySelector('[data-action="ADD_FOUR"]')) // 8
    fireEvent.click(container.querySelector('[data-action="DOUBLE"]')) // 16
    expect(container.querySelector('#d').textContent).toBe('16')
    expect(container.querySelector('#ttl').textContent).toBe('Counter (3 clicks)')
    expect(container.querySelector('#d').className).toContain('positive-high')
  })

  it('does nothing when clicking inside the container but not on a data-action element', () => {
    const { container } = render(<Counter />)
    const before = {
      value: container.querySelector('#d').textContent,
      title: container.querySelector('#ttl').textContent,
    }
    fireEvent.click(container.querySelector('#counter'))
    fireEvent.click(container.querySelector('#ttl'))
    expect(container.querySelector('#d').textContent).toBe(before.value)
    expect(container.querySelector('#ttl').textContent).toBe(before.title)
  })
})
