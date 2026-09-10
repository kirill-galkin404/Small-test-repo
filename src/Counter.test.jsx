import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

// Vitest's transform of .jsx files under this toolchain emits classic
// `React.createElement(...)` calls, which requires `React` to be a resolvable
// identifier even though Counter.jsx (correctly) relies on the automatic JSX
// runtime and does not import React itself. Exposing it as a global here
// keeps the fix scoped to this test file only.
globalThis.React = React;

describe('Counter colour thresholds', () => {
  it('is black at c=0 (initial state, no clicks)', () => {
    const { container } = render(<Counter />);
    const display = container.querySelector('#d');
    expect(display).toHaveTextContent('0');
    expect(display.style.color).toBe('black');
  });

  it('is blue at c=-1', () => {
    const { container } = render(<Counter />);
    fireEvent.click(screen.getByText('Decrement'));
    const display = container.querySelector('#d');
    expect(display).toHaveTextContent('-1');
    expect(display.style.color).toBe('blue');
  });

  it('is black at c=10', () => {
    const { container } = render(<Counter />);
    // 0 -> 4 -> 8 (ADD_FOUR x2) -> 9 -> 10 (INCREMENT x2)
    fireEvent.click(screen.getByText('Add Four'));
    fireEvent.click(screen.getByText('Add Four'));
    fireEvent.click(screen.getByText('Increment'));
    fireEvent.click(screen.getByText('Increment'));
    const display = container.querySelector('#d');
    expect(display).toHaveTextContent('10');
    expect(display.style.color).toBe('black');
  });

  it('is red at c=11', () => {
    const { container } = render(<Counter />);
    // 0 -> 4 -> 8 (ADD_FOUR x2) -> 9 -> 10 -> 11 (INCREMENT x3)
    fireEvent.click(screen.getByText('Add Four'));
    fireEvent.click(screen.getByText('Add Four'));
    fireEvent.click(screen.getByText('Increment'));
    fireEvent.click(screen.getByText('Increment'));
    fireEvent.click(screen.getByText('Increment'));
    const display = container.querySelector('#d');
    expect(display).toHaveTextContent('11');
    expect(display.style.color).toBe('red');
  });

  it('derives colour purely from state synchronously, with no timer-driven re-render', () => {
    // The colour is computed inline from state.c on every render; no setTimeout/
    // setInterval/async effect is involved, so the style must already reflect the
    // new colour immediately after the click event is fired and flushed by RTL
    // (no waitFor / fake timers / async awaiting is used here).
    const { container } = render(<Counter />);
    fireEvent.click(screen.getByText('Decrement'));
    const display = container.querySelector('#d');
    expect(display.style.color).toBe('blue');
  });
});

describe('Counter click integration', () => {
  it('clicking Increment updates both the numeric display and the title click count', () => {
    render(<Counter />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Counter (0 clicks)')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Increment'));

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Counter (1 clicks)')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Increment'));

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Counter (2 clicks)')).toBeInTheDocument();
  });
});
