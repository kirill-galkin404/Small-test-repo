import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter.jsx';

const value = () => document.getElementById('d');
const title = () => document.getElementById('ttl');

async function click(user, label, times = 1) {
  for (let i = 0; i < times; i++) {
    await user.click(screen.getByRole('button', { name: label }));
  }
}

describe('Counter', () => {
  it('renders initial markup', () => {
    render(<Counter />);
    expect(document.getElementById('counter')).not.toBeNull();
    expect(title().textContent).toBe('Counter');
    expect(value().textContent).toBe('0');
    expect(value().style.color).toBe('black');
    const actions = [...document.querySelectorAll('button')].map((b) => b.dataset.action);
    expect(actions).toEqual(['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE']);
    expect([...document.querySelectorAll('button')].map((b) => b.textContent)).toEqual(['+', '-', 'reset', '+4', 'x2']);
  });

  it('increments and updates heading', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await click(user, '+');
    expect(value().textContent).toBe('1');
    expect(title().textContent).toBe('Counter (1 clicks)');
    await click(user, '+');
    expect(title().textContent).toBe('Counter (2 clicks)');
  });

  it('decrements', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await click(user, '-');
    expect(value().textContent).toBe('-1');
  });

  it('adds four', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await click(user, '+4');
    expect(value().textContent).toBe('4');
  });

  it('doubles', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await click(user, '+4');
    await click(user, 'x2');
    expect(value().textContent).toBe('8');
  });

  it('reset sets 0 and still counts a click', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await click(user, '+4');
    await click(user, 'reset');
    expect(value().textContent).toBe('0');
    expect(title().textContent).toBe('Counter (2 clicks)');
  });

  it('colour thresholds', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await click(user, '-');
    expect(value().textContent).toBe('-1');
    expect(value().style.color).toBe('blue');
    await click(user, 'reset');
    expect(value().style.color).toBe('black');
    await click(user, '+4', 2);
    await click(user, '+', 2);
    expect(value().textContent).toBe('10');
    expect(value().style.color).toBe('black');
    await click(user, '+');
    expect(value().textContent).toBe('11');
    expect(value().style.color).toBe('red');
  });
});
