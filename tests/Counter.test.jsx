import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Counter from '../src/Counter.jsx';

afterEach(() => {
  cleanup();
});

const d = () => document.querySelector('#d');
const ttl = () => document.querySelector('#ttl');
const btn = (action) => document.querySelector(`button[data-action="${action}"]`);
const press = (...actions) => actions.forEach((a) => fireEvent.click(btn(a)));

describe('<Counter />', () => {
  it('renders the structure with five labelled buttons', () => {
    render(<Counter />);
    expect(document.querySelector('#counter')).not.toBeNull();
    expect(ttl().tagName).toBe('H1');
    expect(ttl().textContent).toBe('Counter');
    expect(d().tagName).toBe('P');
    expect(d().textContent).toBe('0');
    const labels = { INCREMENT: '+', DECREMENT: '-', RESET: 'reset', ADD_FOUR: '+4', DOUBLE: 'x2' };
    const buttons = [...document.querySelectorAll('button[data-action]')];
    expect(buttons.map((b) => b.dataset.action)).toEqual(Object.keys(labels));
    expect(buttons.map((b) => b.textContent)).toEqual(Object.values(labels));
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('applies each action to the value', () => {
    render(<Counter />);
    press('INCREMENT', 'ADD_FOUR');
    expect(d().textContent).toBe('5');
    press('DOUBLE');
    expect(d().textContent).toBe('10');
    press('DECREMENT');
    expect(d().textContent).toBe('9');
    press('RESET');
    expect(d().textContent).toBe('0');
  });

  it('counts every recognised action in the title, including reset', () => {
    render(<Counter />);
    press('INCREMENT', 'RESET', 'RESET');
    expect(ttl().textContent).toBe('Counter (3 clicks)');
  });

  it('colours red above 10, blue below 0, black otherwise', () => {
    render(<Counter />);
    expect(['', 'black']).toContain(d().style.color);
    press('DECREMENT');
    expect(d().style.color).toBe('blue');
    press('RESET', 'ADD_FOUR', 'ADD_FOUR', 'INCREMENT', 'INCREMENT');
    expect(d().textContent).toBe('10');
    expect(d().style.color).toBe('black');
    press('INCREMENT');
    expect(d().textContent).toBe('11');
    expect(d().style.color).toBe('red');
  });

  it('ignores clicks on non-action elements', () => {
    render(<Counter />);
    fireEvent.click(d());
    fireEvent.click(ttl());
    fireEvent.click(document.querySelector('#counter'));
    expect(d().textContent).toBe('0');
    expect(ttl().textContent).toBe('Counter');
  });
});
