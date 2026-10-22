import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App.jsx';

const css = readFileSync(resolve(__dirname, 'style.css'), 'utf8');

const value = () => document.getElementById('d').textContent;
const title = () => document.getElementById('ttl').textContent;
const tone = () => document.getElementById('d').getAttribute('data-tone');
const button = (action) => document.querySelector(`[data-action="${action}"]`);
const click = (action) => fireEvent.click(button(action));

// jsdom does not load src/style.css, so tones are asserted through data-tone
// plus a check that the stylesheet maps each tone to the legacy colour.
const toneColor = (t) =>
  css.match(new RegExp(`#d\\[data-tone="${t}"\\]\\s*\\{[^}]*color:\\s*(\\w+)`))?.[1];

describe('rendering', () => {
  it('renders the five buttons with data-action and labels', () => {
    render(<App />);
    const expected = {
      INCREMENT: '+',
      DECREMENT: '-',
      RESET: 'reset',
      ADD_FOUR: '+4',
      DOUBLE: 'x2',
    };
    for (const [action, label] of Object.entries(expected)) {
      expect(button(action)).toHaveTextContent(label);
      expect(button(action).tagName).toBe('BUTTON');
    }
    expect(document.querySelectorAll('button')).toHaveLength(5);
    expect(document.getElementById('counter')).toBeInTheDocument();
  });

  it('shows "Counter (0 clicks)" and 0 initially (D-0004)', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Counter (0 clicks)');
    expect(title()).toBe('Counter (0 clicks)');
    expect(value()).toBe('0');
    expect(tone()).toBe('neutral');
  });
});

describe('counter actions', () => {
  it('increments by 1', () => {
    render(<App />);
    click('INCREMENT');
    expect(value()).toBe('1');
  });

  it('decrements by 1 with no lower bound', () => {
    render(<App />);
    click('DECREMENT');
    expect(value()).toBe('-1');
    click('DECREMENT');
    expect(value()).toBe('-2');
  });

  it('adds 4', () => {
    render(<App />);
    click('ADD_FOUR');
    expect(value()).toBe('4');
  });

  it('doubles', () => {
    render(<App />);
    click('INCREMENT');
    click('DOUBLE');
    expect(value()).toBe('2');
  });

  it('doubling zero stays zero', () => {
    render(<App />);
    click('DOUBLE');
    expect(value()).toBe('0');
  });

  it('resets to 0', () => {
    render(<App />);
    click('ADD_FOUR');
    click('RESET');
    expect(value()).toBe('0');
  });

  it('has no upper bound', () => {
    render(<App />);
    for (let i = 0; i < 10; i++) click('DOUBLE');
    click('ADD_FOUR');
    for (let i = 0; i < 10; i++) click('DOUBLE');
    expect(value()).toBe(String(4 * 1024));
  });

  it('runs the sequence from value 3: 4, 8, 16, 15, 0', () => {
    render(<App />);
    click('INCREMENT');
    click('INCREMENT');
    click('INCREMENT');
    expect(value()).toBe('3');
    const seen = [];
    for (const action of ['INCREMENT', 'ADD_FOUR', 'DOUBLE', 'DECREMENT', 'RESET']) {
      click(action);
      seen.push(value());
    }
    expect(seen).toEqual(['4', '8', '16', '15', '0']);
  });
});

describe('click tally and title', () => {
  it('counts every recognized action including reset', () => {
    render(<App />);
    ['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE'].forEach(click);
    expect(title()).toBe('Counter (5 clicks)');
  });

  it('uses the title format "Counter (N clicks)"', () => {
    render(<App />);
    click('INCREMENT');
    expect(title()).toBe('Counter (1 clicks)');
    click('INCREMENT');
    expect(title()).toBe('Counter (2 clicks)');
  });

  it('counts reset on its own', () => {
    render(<App />);
    click('RESET');
    expect(title()).toBe('Counter (1 clicks)');
    expect(value()).toBe('0');
  });
});

describe('tones', () => {
  it('maps tones to the legacy colours in the stylesheet', () => {
    expect(toneColor('high')).toBe('red');
    expect(toneColor('low')).toBe('blue');
    expect(toneColor('neutral')).toBe('black');
  });

  it('is neutral at 0', () => {
    render(<App />);
    click('RESET');
    expect(tone()).toBe('neutral');
  });

  it('is neutral at exactly 10', () => {
    render(<App />);
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('INCREMENT');
    click('INCREMENT');
    expect(value()).toBe('10');
    expect(tone()).toBe('neutral');
  });

  it('is high above 10', () => {
    render(<App />);
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('ADD_FOUR');
    expect(value()).toBe('12');
    expect(tone()).toBe('high');
  });

  it('is low below 0', () => {
    render(<App />);
    click('DECREMENT');
    expect(tone()).toBe('low');
  });

  it('returns to neutral after reset from high or low', () => {
    render(<App />);
    click('DECREMENT');
    click('RESET');
    expect(tone()).toBe('neutral');
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('RESET');
    expect(tone()).toBe('neutral');
  });
});

describe('unrecognized input', () => {
  // An unknown data-action is a reducer-level no-op (see counterReducer.test.js).
  // The legacy console.warn is intentionally dropped (D-0004).
  it('ignores clicks on elements without data-action', () => {
    render(<App />);
    click('INCREMENT');
    const before = document.body.outerHTML;
    fireEvent.click(document.getElementById('ttl'));
    fireEvent.click(document.getElementById('d'));
    fireEvent.click(document.getElementById('counter'));
    expect(document.body.outerHTML).toBe(before);
    expect(value()).toBe('1');
    expect(title()).toBe('Counter (1 clicks)');
  });
});

describe('stylesheet (D-0004)', () => {
  it('styles every button including +4 and x2', () => {
    for (const action of ['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE']) {
      expect(css).toMatch(new RegExp(`button\\[data-action="${action}"\\]`));
    }
  });
});
