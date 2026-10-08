import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from './Counter.jsx'

const setup = () => {
  const user = userEvent.setup()
  const { container } = render(<Counter />)
  const press = async (name) =>
    user.click(screen.getByRole('button', { name }))
  const value = () => screen.getByTestId('value')
  const title = () => screen.getByRole('heading', { level: 1 })
  return { user, container, press, value, title }
}

describe('Counter', () => {
  it('renders initial value 0 and title "Counter (0 clicks)"', () => {
    const { value, title } = setup()
    expect(value()).toHaveTextContent('0')
    expect(title()).toHaveTextContent('Counter (0 clicks)')
  })

  it('+ increments the value and the click count', async () => {
    const { press, value, title } = setup()
    await press('+')
    expect(value()).toHaveTextContent('1')
    expect(title()).toHaveTextContent('Counter (1 click)')
  })

  it('- decrements the value (no lower bound) and counts', async () => {
    const { press, value, title } = setup()
    await press('-')
    await press('-')
    expect(value()).toHaveTextContent('-2')
    expect(title()).toHaveTextContent('Counter (2 clicks)')
  })

  it('+4 adds four and counts', async () => {
    const { press, value, title } = setup()
    await press('+4')
    expect(value()).toHaveTextContent('4')
    expect(title()).toHaveTextContent('Counter (1 click)')
  })

  it('x2 doubles the value and counts', async () => {
    const { press, value, title } = setup()
    await press('+')
    await press('+')
    await press('+')
    await press('x2')
    expect(value()).toHaveTextContent('6')
    expect(title()).toHaveTextContent('Counter (4 clicks)')
  })

  it('reset returns the value to 0 but still counts as a click', async () => {
    const { press, value, title } = setup()
    await press('+4')
    await press('reset')
    expect(value()).toHaveTextContent('0')
    expect(title()).toHaveTextContent('Counter (2 clicks)')
  })

  it('clicking outside any button changes nothing', async () => {
    const { user, container, value, title } = setup()
    await user.click(container.querySelector('#counter'))
    await user.click(title())
    await user.click(value())
    expect(value()).toHaveTextContent('0')
    expect(title()).toHaveTextContent('Counter (0 clicks)')
  })

  it('does not render the title or value through raw markup', () => {
    const { container } = setup()
    expect(container.querySelectorAll('h1 *')).toHaveLength(0)
  })
})

describe('value colour tone', () => {
  const reach10 = async (press) => {
    await press('+4')
    await press('+4')
    await press('+')
    await press('+')
  }

  it('is neutral at 0', () => {
    const { value } = setup()
    expect(value()).toHaveClass('value--neutral')
  })

  it('is neutral at 10 and high at 11', async () => {
    const { press, value } = setup()
    await reach10(press)
    expect(value()).toHaveTextContent('10')
    expect(value()).toHaveClass('value--neutral')
    await press('+')
    expect(value()).toHaveTextContent('11')
    expect(value()).toHaveClass('value--high')
  })

  it('is low at -1 and neutral again after reset to 0', async () => {
    const { press, value } = setup()
    await press('-')
    expect(value()).toHaveTextContent('-1')
    expect(value()).toHaveClass('value--low')
    await press('reset')
    expect(value()).toHaveTextContent('0')
    expect(value()).toHaveClass('value--neutral')
  })

  it('returns to neutral at 0 after being high', async () => {
    const { press, value } = setup()
    await reach10(press)
    await press('+')
    expect(value()).toHaveClass('value--high')
    await press('reset')
    expect(value()).toHaveClass('value--neutral')
  })
})

describe('intentional change: title pluralisation and count from first render', () => {
  it('shows "0 clicks" initially, "1 click" after one click, "N clicks" after more', async () => {
    const { press, title } = setup()
    expect(title()).toHaveTextContent('Counter (0 clicks)')
    await press('+')
    expect(title()).toHaveTextContent('Counter (1 click)')
    expect(title()).not.toHaveTextContent('1 clicks')
    await press('+')
    expect(title()).toHaveTextContent('Counter (2 clicks)')
    await press('+')
    expect(title()).toHaveTextContent('Counter (3 clicks)')
  })
})
