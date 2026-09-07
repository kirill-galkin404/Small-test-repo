import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from './Counter.jsx'

describe('Counter component', () => {
  it('renders the value display and five action buttons', () => {
    render(<Counter />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('increments the value by 1 when the increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrements the value by 1 when the decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('resets the value to 0 when the reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    await user.click(screen.getByRole('button', { name: /increment/i }))
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('adds 4 to the value when the +4 button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /add 4/i }))
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('doubles the value when the x2 button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /add 4/i }))
    await user.click(screen.getByRole('button', { name: /double/i }))
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('increments the dispatch count only when a recognized action is dispatched', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText(/Counter \(1 actions\)/)).toBeInTheDocument()
  })

  it('accessibility: value display has aria-live=polite and buttons have accessible names', () => {
    render(<Counter />)
    const value = screen.getByText('0')
    expect(value).toHaveAttribute('aria-live', 'polite')

    expect(screen.getByRole('button', { name: 'Increment counter by 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrement counter by 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset counter to 0' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add 4 to counter' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Double the counter' })).toBeInTheDocument()
  })

  it('title label: shows the corrected "actions" wording, not "clicks"', () => {
    render(<Counter />)
    expect(screen.getByText(/Counter \(0 actions\)/)).toBeInTheDocument()
    expect(screen.queryByText(/clicks/i)).not.toBeInTheDocument()
  })
})
