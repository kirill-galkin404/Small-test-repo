import { describe, it, expect } from 'vitest'
import { increment, decrement, reset, addFour, double } from './arithmetic.js'

describe('arithmetic rules', () => {
  it('increment adds exactly 1', () => {
    expect(increment(0)).toBe(1)
    expect(increment(5)).toBe(6)
  })

  it('decrement subtracts exactly 1', () => {
    expect(decrement(0)).toBe(-1)
    expect(decrement(5)).toBe(4)
  })

  it('decrement supports negative values (no lower bound)', () => {
    expect(decrement(-5)).toBe(-6)
  })

  it('reset sets the value to 0 regardless of current value', () => {
    expect(reset(42)).toBe(0)
    expect(reset(-42)).toBe(0)
    expect(reset(0)).toBe(0)
  })

  it('addFour adds exactly 4', () => {
    expect(addFour(0)).toBe(4)
    expect(addFour(-2)).toBe(2)
  })

  it('double multiplies the current value by 2', () => {
    expect(double(3)).toBe(6)
    expect(double(0)).toBe(0)
  })

  it('double supports negative values (no lower bound)', () => {
    expect(double(-3)).toBe(-6)
  })
})
