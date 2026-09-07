import { describe, it, expect } from 'vitest'
import { colorForValue } from './color.js'

describe('color threshold rules', () => {
  it('renders black at the lower boundary c=0', () => {
    expect(colorForValue(0)).toBe('black')
  })

  it('renders black at the upper boundary c=10', () => {
    expect(colorForValue(10)).toBe('black')
  })

  it('renders black for values strictly between the boundaries', () => {
    expect(colorForValue(5)).toBe('black')
  })

  it('renders blue for negative values', () => {
    expect(colorForValue(-1)).toBe('blue')
    expect(colorForValue(-100)).toBe('blue')
  })

  it('renders red for values greater than 10', () => {
    expect(colorForValue(11)).toBe('red')
    expect(colorForValue(1000)).toBe('red')
  })
})
