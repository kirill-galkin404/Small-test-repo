import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { useTheme } from './useTheme.js'

const STORAGE_KEY = 'kh-counter-theme'

// A tiny harness component so useTheme (a hook) can be exercised through
// @testing-library/react without a separate hooks-testing dependency.
function Harness() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme === null ? 'null' : theme}</span>
      <button onClick={() => setTheme('dark')}>set-dark</button>
      <button onClick={() => setTheme('light')}>set-light</button>
      <button onClick={() => setTheme('purple')}>set-invalid</button>
    </div>
  )
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('starts with theme=null and no data-theme attribute when localStorage is empty', () => {
    const { getByTestId } = render(<Harness />)
    expect(getByTestId('theme').textContent).toBe('null')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('reads and applies a valid persisted preference on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')
    const { getByTestId } = render(<Harness />)
    expect(getByTestId('theme').textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('treats a corrupted/unexpected persisted value as no preference', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid')
    const { getByTestId } = render(<Harness />)
    expect(getByTestId('theme').textContent).toBe('null')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('setTheme("dark") sets data-theme and persists to localStorage under the fixed key', () => {
    const { getByText, getByTestId } = render(<Harness />)
    fireEvent.click(getByText('set-dark'))
    expect(getByTestId('theme').textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
  })

  it('setTheme("light") sets data-theme and persists to localStorage under the fixed key', () => {
    const { getByText, getByTestId } = render(<Harness />)
    fireEvent.click(getByText('set-light'))
    expect(getByTestId('theme').textContent).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light')
  })

  it('ignores an invalid value passed to setTheme and does not write it anywhere', () => {
    const { getByText, getByTestId } = render(<Harness />)
    fireEvent.click(getByText('set-invalid'))
    expect(getByTestId('theme').textContent).toBe('null')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
