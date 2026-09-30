import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle.jsx'

const STORAGE_KEY = 'kh-counter-theme'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows the "following system" label when there is no persisted preference', () => {
    const { getByRole } = render(<ThemeToggle />)
    expect(getByRole('button').textContent).toBe('Toggle theme (following system)')
  })

  it('shows "Switch to light theme" once dark is persisted, and applies data-theme="dark" on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')
    const { getByRole } = render(<ThemeToggle />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(getByRole('button').textContent).toBe('Switch to light theme')
  })

  it('shows "Switch to dark theme" once light is persisted', () => {
    localStorage.setItem(STORAGE_KEY, 'light')
    const { getByRole } = render(<ThemeToggle />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(getByRole('button').textContent).toBe('Switch to dark theme')
  })

  it('clicking toggles data-theme on <html> and persists the choice to localStorage', () => {
    const { getByRole } = render(<ThemeToggle />)
    fireEvent.click(getByRole('button'))
    const theme = document.documentElement.getAttribute('data-theme')
    expect(['light', 'dark']).toContain(theme)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(theme)

    fireEvent.click(getByRole('button'))
    const flipped = document.documentElement.getAttribute('data-theme')
    expect(flipped).not.toBe(theme)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(flipped)
  })

  it('ignores a corrupted/unexpected persisted value and falls back to following-system', () => {
    localStorage.setItem(STORAGE_KEY, 'not-a-real-theme')
    const { getByRole } = render(<ThemeToggle />)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(getByRole('button').textContent).toBe('Toggle theme (following system)')
  })
})
