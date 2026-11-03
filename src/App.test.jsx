import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App.jsx';

afterEach(cleanup);

const labels = { INCREMENT: '+', DECREMENT: '-', RESET: 'reset', ADD_FOUR: '+4', DOUBLE: 'x2' };
const btn = (name) => screen.getByRole('button', { name: labels[name] });
const click = (name, times = 1) => {
  for (let i = 0; i < times; i++) fireEvent.click(btn(name));
};
const value = () => container().querySelector('#d');
let current;
const container = () => current;
const setup = () => {
  current = render(<App />).container;
};

describe('App', () => {
  it('renders original markup with data-action attributes', () => {
    setup();
    expect(current.querySelector('#counter')).not.toBeNull();
    expect(current.querySelector('#ttl')).not.toBeNull();
    expect(value().textContent).toBe('0');
    for (const name of Object.keys(labels)) {
      expect(btn(name).getAttribute('data-action')).toBe(name);
    }
  });

  it('applies each action effect', () => {
    setup();
    click('INCREMENT');
    expect(value().textContent).toBe('1');
    click('DECREMENT');
    expect(value().textContent).toBe('0');
    click('ADD_FOUR');
    expect(value().textContent).toBe('4');
    click('DOUBLE');
    expect(value().textContent).toBe('8');
    click('RESET');
    expect(value().textContent).toBe('0');
  });

  it('colours red above 10, blue below 0, black otherwise', () => {
    setup();
    expect(value().style.color).toBe('black');
    click('DECREMENT');
    expect(value().style.color).toBe('blue');
    click('RESET');
    expect(value().style.color).toBe('black');
    click('ADD_FOUR', 2);
    click('INCREMENT', 2);
    expect(value().textContent).toBe('10');
    expect(value().style.color).toBe('black');
    click('INCREMENT');
    expect(value().textContent).toBe('11');
    expect(value().style.color).toBe('red');
  });

  it('formats the title and counts RESET as a click', () => {
    setup();
    const ttl = () => current.querySelector('#ttl').textContent;
    expect(ttl()).toBe('Counter');
    click('INCREMENT');
    expect(ttl()).toBe('Counter (1 clicks)');
    click('RESET');
    expect(ttl()).toBe('Counter (2 clicks)');
    click('DOUBLE');
    expect(ttl()).toBe('Counter (3 clicks)');
  });
});
