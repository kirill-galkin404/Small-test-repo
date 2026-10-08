import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from './Counter.jsx'
import { getInitialTheme } from './theme.js'

const originalMatchMedia = window.matchMedia

const stubMatchMedia = (matches) => {
  window.matchMedia = (query) => ({
    matches: query === '(prefers-color-scheme: dark)' ? matches : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

const theme = () => document.documentElement.dataset.theme

beforeEach(() => {
  delete document.documentElement.dataset.theme
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
  delete document.documentElement.dataset.theme
})

describe('default theme', () => {
  it('is dark when the system prefers dark', () => {
    stubMatchMedia(true)
    render(<Counter />)
    expect(theme()).toBe('dark')
  })

  it('is light when the system does not prefer dark', () => {
    stubMatchMedia(false)
    render(<Counter />)
    expect(theme()).toBe('light')
  })

  it('falls back to light when matchMedia is unavailable', () => {
    window.matchMedia = undefined
    expect(getInitialTheme()).toBe('light')
  })
})

describe('theme toggle', () => {
  it('switches light -> dark -> light and updates its accessible name', async () => {
    stubMatchMedia(false)
    const user = userEvent.setup()
    render(<Counter />)
    expect(theme()).toBe('light')

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(theme()).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(theme()).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
  })

  it('does not change the counter state', async () => {
    stubMatchMedia(false)
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: '+' }))
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(screen.getByTestId('value')).toHaveTextContent('1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Counter (1 click)')
  })
})
