import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('App', () => {
  it('renders the counter view by default (root redirects to counter)', () => {
    render(<App />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('renders the value in red once it exceeds 10', async () => {
    const user = userEvent.setup()
    render(<App />)
    const addFour = screen.getByRole('button', { name: /add 4/i })
    await user.click(addFour)
    await user.click(addFour)
    await user.click(addFour)
    const value = screen.getByText('12')
    expect(value).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('renders the value in blue once it goes negative', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    const value = screen.getByText('-1')
    expect(value).toHaveStyle({ color: 'rgb(0, 0, 255)' })
  })

  it('renders the value in black at the default 0', () => {
    render(<App />)
    const value = screen.getByText('0')
    expect(value).toHaveStyle({ color: 'rgb(0, 0, 0)' })
  })
})
