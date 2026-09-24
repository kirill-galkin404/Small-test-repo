import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, fireEvent } from '@testing-library/react';
import Counter from './Counter.jsx';

expect.extend(matchers);

const ACTION_NAMES = ['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE'];

function getDisplay(container) {
  return container.querySelector('#d');
}

function getTitle(container) {
  return container.querySelector('#ttl');
}

function getButton(container, actionName) {
  return container.querySelector(`button[data-action="${actionName}"]`);
}

describe('<Counter />', () => {
  it('renders 0 and the initial title on first paint, before any interaction', () => {
    const { container } = render(<Counter />);

    expect(getDisplay(container)).toHaveTextContent('0');
    expect(getDisplay(container)).toHaveAttribute('data-color-state', 'black');
    expect(getTitle(container)).toHaveTextContent('Counter (0 clicks)');
  });

  it('renders all 5 data-action buttons', () => {
    const { container } = render(<Counter />);

    ACTION_NAMES.forEach((name) => {
      expect(getButton(container, name)).toBeInTheDocument();
    });
  });

  it('updates the title to "Counter (N clicks)" as each button dispatches', () => {
    const { container } = render(<Counter />);

    fireEvent.click(getButton(container, 'INCREMENT'));
    expect(getTitle(container)).toHaveTextContent('Counter (1 clicks)');

    fireEvent.click(getButton(container, 'ADD_FOUR'));
    expect(getTitle(container)).toHaveTextContent('Counter (2 clicks)');

    fireEvent.click(getButton(container, 'DOUBLE'));
    expect(getTitle(container)).toHaveTextContent('Counter (3 clicks)');
  });

  it('clicking each of the 5 action buttons updates the display value and its colour-state indicator', () => {
    const { container } = render(<Counter />);

    // INCREMENT: 0 -> 1, stays in the black band.
    fireEvent.click(getButton(container, 'INCREMENT'));
    expect(getDisplay(container)).toHaveTextContent('1');
    expect(getDisplay(container)).toHaveAttribute('data-color-state', 'black');
    expect(getDisplay(container).className).toContain('counter-display--black');

    // DOUBLE: 1 -> 2.
    fireEvent.click(getButton(container, 'DOUBLE'));
    expect(getDisplay(container)).toHaveTextContent('2');

    // ADD_FOUR: 2 -> 6.
    fireEvent.click(getButton(container, 'ADD_FOUR'));
    expect(getDisplay(container)).toHaveTextContent('6');

    // DECREMENT: 6 -> 5.
    fireEvent.click(getButton(container, 'DECREMENT'));
    expect(getDisplay(container)).toHaveTextContent('5');

    // RESET: back to 0, black band.
    fireEvent.click(getButton(container, 'RESET'));
    expect(getDisplay(container)).toHaveTextContent('0');
    expect(getDisplay(container)).toHaveAttribute('data-color-state', 'black');
    expect(getDisplay(container).className).toContain('counter-display--black');
  });

  it('flips the colour-state from black to red when c crosses from 10 to 11', () => {
    const { container } = render(<Counter />);
    const increment = getButton(container, 'INCREMENT');

    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(increment);
    }

    expect(getDisplay(container)).toHaveTextContent('10');
    expect(getDisplay(container)).toHaveAttribute('data-color-state', 'black');
    expect(getDisplay(container).className).toContain('counter-display--black');

    fireEvent.click(increment);

    expect(getDisplay(container)).toHaveTextContent('11');
    expect(getDisplay(container)).toHaveAttribute('data-color-state', 'red');
    expect(getDisplay(container).className).toContain('counter-display--red');
  });

  it('flips the colour-state from black to blue when c crosses from 0 to -1', () => {
    const { container } = render(<Counter />);

    expect(getDisplay(container)).toHaveTextContent('0');
    expect(getDisplay(container)).toHaveAttribute('data-color-state', 'black');
    expect(getDisplay(container).className).toContain('counter-display--black');

    fireEvent.click(getButton(container, 'DECREMENT'));

    expect(getDisplay(container)).toHaveTextContent('-1');
    expect(getDisplay(container)).toHaveAttribute('data-color-state', 'blue');
    expect(getDisplay(container).className).toContain('counter-display--blue');
  });
});
