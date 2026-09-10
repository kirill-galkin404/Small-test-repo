import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './Counter.jsx'
import { ACTION, initialState, counterReducer } from './counterReducer.js'

function getDisplay() {
  return document.getElementById('d')
}

function getTitle() {
  return document.getElementById('ttl')
}

describe('counterReducer', () => {
  it('INCREMENT adds 1 to c and increments cc', () => {
    const state = counterReducer({ c: 5, cc: 0 }, ACTION.INCREMENT)
    expect(state).toEqual({ c: 6, cc: 1 })
  })

  it('DECREMENT subtracts 1 from c and increments cc', () => {
    const state = counterReducer({ c: 5, cc: 0 }, ACTION.DECREMENT)
    expect(state).toEqual({ c: 4, cc: 1 })
  })

  it('DECREMENT below zero goes negative', () => {
    const state = counterReducer({ c: 0, cc: 0 }, ACTION.DECREMENT)
    expect(state).toEqual({ c: -1, cc: 1 })
  })

  it('RESET sets c to 0 and increments cc', () => {
    const state = counterReducer({ c: 42, cc: 3 }, ACTION.RESET)
    expect(state).toEqual({ c: 0, cc: 4 })
  })

  it('ADD_FOUR adds 4 to c and increments cc', () => {
    const state = counterReducer({ c: 2, cc: 0 }, ACTION.ADD_FOUR)
    expect(state).toEqual({ c: 6, cc: 1 })
  })

  it('DOUBLE doubles c from 0', () => {
    const state = counterReducer({ c: 0, cc: 0 }, ACTION.DOUBLE)
    expect(state).toEqual({ c: 0, cc: 1 })
  })

  it('DOUBLE doubles a positive c', () => {
    const state = counterReducer({ c: 5, cc: 0 }, ACTION.DOUBLE)
    expect(state).toEqual({ c: 10, cc: 1 })
  })

  it('DOUBLE doubles a negative c', () => {
    const state = counterReducer({ c: -3, cc: 0 }, ACTION.DOUBLE)
    expect(state).toEqual({ c: -6, cc: 1 })
  })

  it('rejects an unrecognized action, leaving c and cc unchanged', () => {
    const before = { c: 7, cc: 2 }
    const after = counterReducer(before, 'NOT_A_REAL_ACTION')
    expect(after).toEqual(before)
    expect(after).toBe(before)
  })
})

describe('Counter component', () => {
  it('renders the initial state', () => {
    render(<Counter />)
    expect(getDisplay()).toHaveTextContent('0')
    expect(getTitle()).toHaveTextContent('Counter (0 clicks)')
  })

  it('INCREMENT increments the display and cc once', () => {
    render(<Counter />)
    fireEvent.click(screen.getByText('+'))
    expect(getDisplay()).toHaveTextContent('1')
    expect(getTitle()).toHaveTextContent('Counter (1 clicks)')
  })

  it('DECREMENT decrements the display and cc once', () => {
    render(<Counter />)
    fireEvent.click(screen.getByText('-'))
    expect(getDisplay()).toHaveTextContent('-1')
    expect(getTitle()).toHaveTextContent('Counter (1 clicks)')
  })

  it('RESET returns the display to 0 and increments cc once', () => {
    render(<Counter />)
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByText('reset'))
    expect(getDisplay()).toHaveTextContent('0')
    expect(getTitle()).toHaveTextContent('Counter (2 clicks)')
  })

  it('ADD_FOUR adds 4 to the display and increments cc once', () => {
    render(<Counter />)
    fireEvent.click(screen.getByText('+4'))
    expect(getDisplay()).toHaveTextContent('4')
    expect(getTitle()).toHaveTextContent('Counter (1 clicks)')
  })

  it('DOUBLE doubles the display and increments cc once', () => {
    render(<Counter />)
    fireEvent.click(screen.getByText('+4'))
    fireEvent.click(screen.getByText('x2'))
    expect(getDisplay()).toHaveTextContent('8')
    expect(getTitle()).toHaveTextContent('Counter (2 clicks)')
  })

  it('colors the display black at the c=10 boundary', () => {
    render(<Counter />)
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByText('+'))
    }
    expect(getDisplay()).toHaveTextContent('10')
    expect(getDisplay()).toHaveStyle({ color: 'rgb(0, 0, 0)' })
  })

  it('colors the display red once c exceeds 10', () => {
    render(<Counter />)
    for (let i = 0; i < 11; i++) {
      fireEvent.click(screen.getByText('+'))
    }
    expect(getDisplay()).toHaveTextContent('11')
    expect(getDisplay()).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('colors the display black at c=0', () => {
    render(<Counter />)
    expect(getDisplay()).toHaveTextContent('0')
    expect(getDisplay()).toHaveStyle({ color: 'rgb(0, 0, 0)' })
  })

  it('colors the display blue once c goes below 0', () => {
    render(<Counter />)
    fireEvent.click(screen.getByText('-'))
    expect(getDisplay()).toHaveTextContent('-1')
    expect(getDisplay()).toHaveStyle({ color: 'rgb(0, 0, 255)' })
  })

  it('ignores an unrecognized action dispatched directly to the reducer, leaving state and render unchanged', () => {
    const before = initialState
    const after = counterReducer(before, 'UNRECOGNIZED')
    expect(after).toBe(before)
    expect(after.c).toBe(before.c)
    expect(after.cc).toBe(before.cc)

    render(<Counter />)
    expect(getDisplay()).toHaveTextContent('0')
    expect(getTitle()).toHaveTextContent('Counter (0 clicks)')
  })
})
