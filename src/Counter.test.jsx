import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Counter, { dispatchByName } from './Counter.jsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const btn = (action) => document.querySelector(`button[data-action="${action}"]`);
const click = (action) => fireEvent.click(btn(action));
const d = () => document.getElementById('d');
const ttl = () => document.getElementById('ttl');

describe('Counter', () => {
  it('renders initial state', () => {
    render(<Counter />);
    expect(ttl().textContent).toBe('Counter');
    expect(d().textContent).toBe('0');
    expect(d().style.color).toBe('black');
  });

  it('shows click count after one click', () => {
    render(<Counter />);
    click('INCREMENT');
    expect(ttl().textContent).toBe('Counter (1 clicks)');
    expect(d().textContent).toBe('1');
  });

  it('is red above 10', () => {
    render(<Counter />);
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('ADD_FOUR');
    expect(d().textContent).toBe('12');
    expect(d().style.color).toBe('red');
  });

  it('is black at exactly 10', () => {
    render(<Counter />);
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('INCREMENT');
    click('INCREMENT');
    expect(d().textContent).toBe('10');
    expect(d().style.color).toBe('black');
  });

  it('is blue below 0', () => {
    render(<Counter />);
    click('DECREMENT');
    expect(d().textContent).toBe('-1');
    expect(d().style.color).toBe('blue');
  });

  it('applies DOUBLE and RESET; RESET keeps click count', () => {
    render(<Counter />);
    click('INCREMENT');
    click('DOUBLE');
    expect(d().textContent).toBe('2');
    click('RESET');
    expect(d().textContent).toBe('0');
    expect(d().style.color).toBe('black');
    expect(ttl().textContent).toBe('Counter (3 clicks)');
  });

  it('keeps button order, labels and data-action values', () => {
    render(<Counter />);
    const buttons = Array.from(document.querySelectorAll('#counter button'));
    expect(buttons.map((b) => [b.getAttribute('data-action'), b.textContent])).toEqual([
      ['INCREMENT', '+'],
      ['DECREMENT', '-'],
      ['RESET', 'reset'],
      ['ADD_FOUR', '+4'],
      ['DOUBLE', 'x2'],
    ]);
    expect(document.getElementById('counter')).not.toBeNull();
    expect(screen.getByRole('heading').id).toBe('ttl');
  });

  it('ignores a click on the container itself', () => {
    render(<Counter />);
    fireEvent.click(document.getElementById('counter'));
    expect(ttl().textContent).toBe('Counter');
    expect(d().textContent).toBe('0');
  });
});

describe('dispatchByName', () => {
  it('warns and does not dispatch on an unrecognized action', () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dispatch = vi.fn();
    dispatchByName(dispatch, 'BOGUS');
    expect(warn).toHaveBeenCalledWith('dispatch: unrecognized action', 'BOGUS');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches a recognized action without warning', () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dispatch = vi.fn();
    dispatchByName(dispatch, 'RESET');
    expect(dispatch).toHaveBeenCalledWith({ type: 3 });
    expect(warn).not.toHaveBeenCalled();
  });
});
