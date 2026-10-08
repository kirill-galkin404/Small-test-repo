import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from './Counter.jsx'

const value = () => screen.getByTestId('value')
const button = (label) => screen.getByRole('button', { name: label })

async function press(user, ...labels) {
  for (const label of labels) await user.click(button(label))
}

describe('Counter', () => {
  it('renders the five buttons with data-action attributes and value 0', () => {
    render(<Counter />)
    const expected = { '+': 'INCREMENT', '-': 'DECREMENT', reset: 'RESET', '+4': 'ADD_FOUR', x2: 'DOUBLE' }
    for (const [label, action] of Object.entries(expected)) {
      expect(button(label)).toHaveAttribute('data-action', action)
    }
    expect(value()).toHaveTextContent(/^0$/)
  })

  it('+ adds one', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await press(user, '+')
    expect(value()).toHaveTextContent(/^1$/)
  })

  it('- subtracts one', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await press(user, '-')
    expect(value()).toHaveTextContent(/^-1$/)
  })

  it('+4 adds four', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await press(user, '+4')
    expect(value()).toHaveTextContent(/^4$/)
  })

  it('x2 doubles', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await press(user, '+4', 'x2')
    expect(value()).toHaveTextContent(/^8$/)
  })

  it('reset returns to 0', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await press(user, '+4', '+4', 'reset')
    expect(value()).toHaveTextContent(/^0$/)
  })

  it('shows the click count in heading and document.title, singular for one', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    const heading = () => screen.getByRole('heading', { level: 1 })
    expect(heading()).toHaveTextContent('Counter (0 clicks)')
    expect(document.title).toBe('Counter (0 clicks)')

    await press(user, '+')
    expect(heading()).toHaveTextContent('Counter (1 click)')
    expect(document.title).toBe('Counter (1 click)')

    await press(user, '+')
    expect(heading()).toHaveTextContent('Counter (2 clicks)')
    expect(document.title).toBe('Counter (2 clicks)')
  })

  it('counts reset as a click', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await press(user, '+', 'reset')
    expect(document.title).toBe('Counter (2 clicks)')
  })

  it('tones the value: neutral at 0 and 10, high at 11, low at -1', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    expect(value()).toHaveClass('value--neutral')

    await press(user, '+4', '+4', '+', '+')
    expect(value()).toHaveTextContent(/^10$/)
    expect(value()).toHaveClass('value--neutral')

    await press(user, '+')
    expect(value()).toHaveTextContent(/^11$/)
    expect(value()).toHaveClass('value--high')

    await press(user, 'reset', '-')
    expect(value()).toHaveTextContent(/^-1$/)
    expect(value()).toHaveClass('value--low')

    await press(user, 'reset')
    expect(value()).toHaveClass('value--neutral')
  })
})
