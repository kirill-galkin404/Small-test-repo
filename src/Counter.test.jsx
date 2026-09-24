import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Counter from './Counter.jsx';

afterEach(() => {
  cleanup();
});

// Helper: get the value element (<p id="d">) and title element (<h1 id="ttl">).
function getValueEl() {
  return document.getElementById('d');
}
function getTitleEl() {
  return document.getElementById('ttl');
}

describe('Counter component', () => {
  it('renders initial output: 0 clicks in the title and 0 as the value', () => {
    render(<Counter />);
    expect(getTitleEl()).toHaveTextContent('Counter (0 clicks)');
    expect(getValueEl()).toHaveTextContent('0');
  });

  it('renders the value with a dark-theme CSS custom property color reference', () => {
    render(<Counter />);
    const valueEl = getValueEl();
    // R-0001 neutral category for value 0 is 'black'.
    expect(valueEl.style.color).toBe('var(--value-black)');
  });

  it('exposes exactly 5 buttons mapping to the 5 known actions (no hidden/unrecognized affordance)', () => {
    render(<Counter />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    const labels = buttons.map((b) => b.textContent);
    expect(labels).toEqual(['+', '-', 'reset', '+4', 'x2']);
    // R-0008's core guarantee (an unrecognized action leaves state and
    // clicks unchanged, and by extension triggers no re-render) is
    // exercised directly against the pure reducer in src/reducer.test.js.
    // Since every button in the rendered UI dispatches one of the 5
    // recognized action types, there is no way to trigger the
    // unrecognized-action guard purely through UI clicks; this test
    // instead demonstrates that no such hidden affordance exists.
  });

  it('clicking + (INCREMENT) increases the value by 1 and increments the click count', () => {
    render(<Counter />);
    const plusButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(plusButton);
    expect(getValueEl()).toHaveTextContent('1');
    expect(getTitleEl()).toHaveTextContent('Counter (1 clicks)');
  });

  it('clicking - (DECREMENT) decreases the value by 1 and increments the click count', () => {
    render(<Counter />);
    const minusButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(minusButton);
    expect(getValueEl()).toHaveTextContent('-1');
    expect(getTitleEl()).toHaveTextContent('Counter (1 clicks)');
  });

  it('clicking +4 (ADD_FOUR) increases the value by 4 and increments the click count', () => {
    render(<Counter />);
    const addFourButton = screen.getByRole('button', { name: '+4' });
    fireEvent.click(addFourButton);
    expect(getValueEl()).toHaveTextContent('4');
    expect(getTitleEl()).toHaveTextContent('Counter (1 clicks)');
  });

  it('clicking x2 (DOUBLE) doubles the current value and increments the click count', () => {
    render(<Counter />);
    const addFourButton = screen.getByRole('button', { name: '+4' });
    const doubleButton = screen.getByRole('button', { name: 'x2' });
    fireEvent.click(addFourButton); // value: 4, clicks: 1
    fireEvent.click(doubleButton); // value: 8, clicks: 2
    expect(getValueEl()).toHaveTextContent('8');
    expect(getTitleEl()).toHaveTextContent('Counter (2 clicks)');
  });

  it('clicking reset sets the value back to 0 without resetting the click counter (R-0005/R-0009)', () => {
    render(<Counter />);
    const plusButton = screen.getByRole('button', { name: '+' });
    const resetButton = screen.getByRole('button', { name: 'reset' });

    fireEvent.click(plusButton); // value: 1, clicks: 1
    fireEvent.click(plusButton); // value: 2, clicks: 2
    fireEvent.click(plusButton); // value: 3, clicks: 3
    expect(getValueEl()).toHaveTextContent('3');

    fireEvent.click(resetButton); // value: 0, clicks: 4 (reset itself is a dispatched action)
    expect(getValueEl()).toHaveTextContent('0');
    // Click counter is NOT reset to zero: it reflects all 4 dispatched
    // actions (three increments + the reset click itself).
    expect(getTitleEl()).toHaveTextContent('Counter (4 clicks)');
  });

  it('click count in the title increments on every successfully dispatched action across all button types (R-0009)', () => {
    render(<Counter />);
    const plusButton = screen.getByRole('button', { name: '+' });
    const minusButton = screen.getByRole('button', { name: '-' });
    const resetButton = screen.getByRole('button', { name: 'reset' });
    const addFourButton = screen.getByRole('button', { name: '+4' });
    const doubleButton = screen.getByRole('button', { name: 'x2' });

    fireEvent.click(plusButton);
    fireEvent.click(minusButton);
    fireEvent.click(addFourButton);
    fireEvent.click(doubleButton);
    fireEvent.click(resetButton);

    expect(getTitleEl()).toHaveTextContent('Counter (5 clicks)');
  });

  it('value color category becomes red once the value exceeds 10 (R-0001)', () => {
    render(<Counter />);
    const addFourButton = screen.getByRole('button', { name: '+4' });
    // 4 -> 8 -> 12 (exceeds 10)
    fireEvent.click(addFourButton);
    fireEvent.click(addFourButton);
    fireEvent.click(addFourButton);
    expect(getValueEl()).toHaveTextContent('12');
    expect(getValueEl().style.color).toBe('var(--value-red)');
  });

  it('value color category becomes blue once the value goes negative (R-0001)', () => {
    render(<Counter />);
    const minusButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(minusButton);
    expect(getValueEl()).toHaveTextContent('-1');
    expect(getValueEl().style.color).toBe('var(--value-blue)');
  });

  it('value color category stays black (neutral) for values between 0 and 10 inclusive (R-0001)', () => {
    render(<Counter />);
    const plusButton = screen.getByRole('button', { name: '+' });
    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(plusButton);
    }
    expect(getValueEl()).toHaveTextContent('10');
    expect(getValueEl().style.color).toBe('var(--value-black)');
  });
});
