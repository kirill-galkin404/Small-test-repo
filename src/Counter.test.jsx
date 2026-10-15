import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from './Counter.jsx'

const setup = () => {
  const user = userEvent.setup()
  const { container } = render(<Counter />)
  const press = async (label) =>
    user.click(screen.getByRole('button', { name: label }))
  const value = () => screen.getByTestId('value')
  const heading = () => screen.getByRole('heading', { level: 1 })
  return { user, container, press, value, heading }
}

describe('Counter', () => {
  it('starts at 0 with the plain heading and default tone', () => {
    const { value, heading } = setup()
    expect(value()).toHaveTextContent(/^0$/)
    expect(heading()).toHaveTextContent(/^Counter$/)
    expect(value()).toHaveClass('counter__value--default')
  })

  it('renders the five buttons', () => {
    setup()
    for (const name of ['+', '-', 'reset', '+4', 'x2']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('+ adds one and counts a click', async () => {
    const { press, value, heading } = setup()
    await press('+')
    expect(value()).toHaveTextContent(/^1$/)
    expect(heading()).toHaveTextContent(/^Counter \(1 clicks\)$/)
  })

  it('- subtracts one without a lower bound', async () => {
    const { press, value, heading } = setup()
    await press('-')
    expect(value()).toHaveTextContent(/^-1$/)
    expect(heading()).toHaveTextContent(/^Counter \(1 clicks\)$/)
  })

  it('+4 adds four and counts a click', async () => {
    const { press, value, heading } = setup()
    await press('+4')
    expect(value()).toHaveTextContent(/^4$/)
    expect(heading()).toHaveTextContent(/^Counter \(1 clicks\)$/)
  })

  it('x2 doubles the value and counts a click', async () => {
    const { press, value, heading } = setup()
    await press('+')
    await press('+')
    await press('x2')
    expect(value()).toHaveTextContent(/^4$/)
    expect(heading()).toHaveTextContent(/^Counter \(3 clicks\)$/)
  })

  it('x2 of a negative value stays unbounded (-1 to -2)', async () => {
    const { press, value } = setup()
    await press('-')
    await press('x2')
    expect(value()).toHaveTextContent(/^-2$/)
  })

  it('x2 at zero stays zero but counts a click', async () => {
    const { press, value, heading } = setup()
    await press('x2')
    expect(value()).toHaveTextContent(/^0$/)
    expect(heading()).toHaveTextContent(/^Counter \(1 clicks\)$/)
  })

  it('reset zeroes the value but keeps the tally and counts itself', async () => {
    const { press, value, heading } = setup()
    await press('+4')
    await press('+')
    await press('reset')
    expect(value()).toHaveTextContent(/^0$/)
    expect(heading()).toHaveTextContent(/^Counter \(3 clicks\)$/)
    await press('+')
    expect(value()).toHaveTextContent(/^1$/)
    expect(heading()).toHaveTextContent(/^Counter \(4 clicks\)$/)
  })

  it('reset on a fresh counter still counts a click', async () => {
    const { press, value, heading } = setup()
    await press('reset')
    expect(value()).toHaveTextContent(/^0$/)
    expect(heading()).toHaveTextContent(/^Counter \(1 clicks\)$/)
  })

  describe('tone class', () => {
    it('is high at 11', async () => {
      const { press, value } = setup()
      for (const label of ['+4', '+4', '+', '+', '+']) await press(label)
      expect(value()).toHaveTextContent(/^11$/)
      expect(value()).toHaveClass('counter__value', 'counter__value--high')
      expect(value()).not.toHaveClass('counter__value--default')
    })

    it('is default at 10', async () => {
      const { press, value } = setup()
      for (const label of ['+4', '+4', '+', '+']) await press(label)
      expect(value()).toHaveTextContent(/^10$/)
      expect(value()).toHaveClass('counter__value', 'counter__value--default')
      expect(value()).not.toHaveClass('counter__value--high')
    })

    it('is negative at -1', async () => {
      const { press, value } = setup()
      await press('-')
      expect(value()).toHaveTextContent(/^-1$/)
      expect(value()).toHaveClass('counter__value', 'counter__value--negative')
      expect(value()).not.toHaveClass('counter__value--default')
    })

    it('returns to default after reset from high', async () => {
      const { press, value } = setup()
      for (const label of ['+4', '+4', '+', '+', '+', 'reset']) await press(label)
      expect(value()).toHaveClass('counter__value--default')
    })
  })

  describe('clicks that are not on a button', () => {
    it('leave value, tone and tally unchanged', async () => {
      const { user, container, press, value, heading } = setup()
      await press('+4')
      await user.click(heading())
      await user.click(value())
      await user.click(container.firstChild)
      await user.click(container)
      await user.click(document.body)
      expect(value()).toHaveTextContent(/^4$/)
      expect(value()).toHaveClass('counter__value--default')
      expect(heading()).toHaveTextContent(/^Counter \(1 clicks\)$/)
    })

    it('leave a fresh counter untouched', async () => {
      const { user, value, heading } = setup()
      await user.click(heading())
      await user.click(value())
      expect(value()).toHaveTextContent(/^0$/)
      expect(heading()).toHaveTextContent(/^Counter$/)
    })
  })
})
