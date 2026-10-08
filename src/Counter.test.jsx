import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import Counter from './Counter.jsx';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

const setup = () => {
  const view = render(<Counter />);
  const click = (action) => fireEvent.click(view.container.querySelector(`[data-action="${action}"]`));
  const value = () => view.container.querySelector('#d');
  const title = () => view.container.querySelector('#ttl').textContent;
  return { view, click, value, title };
};

describe('Counter', () => {
  it('renders the initial title and value', () => {
    const { value, title, view } = setup();
    expect(title()).toBe('Counter (0 clicks)');
    expect(value().textContent).toBe('0');
    expect(value().className).toContain('value--normal');
    expect(view.container.querySelectorAll('[data-action]').length).toBe(5);
  });

  it('labels the buttons as before', () => {
    const { view } = setup();
    const labels = [...view.container.querySelectorAll('[data-action]')].map((b) => b.textContent);
    expect(labels).toEqual(['+', '-', 'reset', '+4', 'x2']);
  });

  it('INCREMENT adds 1 and uses singular title', () => {
    const { click, value, title } = setup();
    click('INCREMENT');
    expect(value().textContent).toBe('1');
    expect(title()).toBe('Counter (1 click)');
  });

  it('DECREMENT subtracts 1', () => {
    const { click, value, title } = setup();
    click('DECREMENT');
    expect(value().textContent).toBe('-1');
    expect(title()).toBe('Counter (1 click)');
  });

  it('ADD_FOUR, DOUBLE and RESET update value and count', () => {
    const { click, value, title } = setup();
    click('ADD_FOUR');
    expect(value().textContent).toBe('4');
    click('DOUBLE');
    expect(value().textContent).toBe('8');
    expect(title()).toBe('Counter (2 clicks)');
    click('RESET');
    expect(value().textContent).toBe('0');
    expect(title()).toBe('Counter (3 clicks)');
  });

  it('colours the value high above 10 and low below 0', () => {
    const { click, value } = setup();
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('INCREMENT');
    click('INCREMENT');
    expect(value().textContent).toBe('10');
    expect(value().className).toContain('value--normal');
    click('INCREMENT');
    expect(value().textContent).toBe('11');
    expect(value().className).toContain('value--high');
    click('RESET');
    click('DECREMENT');
    expect(value().textContent).toBe('-1');
    expect(value().className).toContain('value--low');
  });

  it('theme toggle flips data-theme and persists to localStorage', () => {
    const { view } = setup();
    const toggle = view.container.querySelector('.theme-toggle');
    expect(toggle.hasAttribute('data-action')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('counter-theme')).toBe('dark');
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('counter-theme')).toBe('light');
  });

  it('uses the system dark preference when nothing is stored', () => {
    vi.stubGlobal('matchMedia', (query) => ({ matches: query.includes('dark'), media: query }));
    setup();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('stored localStorage choice beats the system preference', () => {
    vi.stubGlobal('matchMedia', (query) => ({ matches: query.includes('dark'), media: query }));
    localStorage.setItem('counter-theme', 'light');
    setup();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
