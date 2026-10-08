import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

const root = document.documentElement

function stubMatchMedia(prefersDark) {
  window.matchMedia = vi.fn((query) => ({
    matches: query.includes('prefers-color-scheme: dark') ? prefersDark : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

const toggle = () => screen.getByRole('button', { name: /switch to/i })

describe('theme toggle', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    window.localStorage.clear()
    root.removeAttribute('data-theme')
    stubMatchMedia(false)
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.restoreAllMocks()
  })

  it('defaults to light when the OS does not prefer dark', () => {
    render(<App />)
    expect(root).toHaveAttribute('data-theme', 'light')
  })

  it('defaults to dark when the OS prefers dark', () => {
    stubMatchMedia(true)
    render(<App />)
    expect(root).toHaveAttribute('data-theme', 'dark')
  })

  it('switches to dark on click and stores the choice', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(toggle())
    expect(root).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
  })

  it('switches back to light on a second click', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(toggle())
    await user.click(toggle())
    expect(root).toHaveAttribute('data-theme', 'light')
    expect(window.localStorage.getItem('theme')).toBe('light')
  })

  it('restores a persisted choice over the OS preference', () => {
    window.localStorage.setItem('theme', 'dark')
    render(<App />)
    expect(root).toHaveAttribute('data-theme', 'dark')
  })

  it('restores a persisted light choice when the OS prefers dark', () => {
    stubMatchMedia(true)
    window.localStorage.setItem('theme', 'light')
    render(<App />)
    expect(root).toHaveAttribute('data-theme', 'light')
  })

  it('ignores an invalid stored value and follows prefers-color-scheme', () => {
    stubMatchMedia(true)
    window.localStorage.setItem('theme', 'purple')
    render(<App />)
    expect(root).toHaveAttribute('data-theme', 'dark')
  })

  it('falls back to light when matchMedia is missing', () => {
    window.matchMedia = undefined
    render(<App />)
    expect(root).toHaveAttribute('data-theme', 'light')
  })

  it('still toggles when localStorage access throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const user = userEvent.setup()
    render(<App />)
    expect(root).toHaveAttribute('data-theme', 'light')
    await user.click(toggle())
    expect(root).toHaveAttribute('data-theme', 'dark')
  })
})
