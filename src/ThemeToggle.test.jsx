import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App.jsx';
import { getInitialTheme } from './theme.js';

const stubMatchMedia = (dark) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)' ? dark : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );

const toggle = () => screen.getByRole('button', { name: 'Dark mode' });
const rootTheme = () => document.documentElement.getAttribute('data-theme');

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
});

describe('theme default', () => {
  it('is dark when the OS prefers dark', () => {
    stubMatchMedia(true);
    render(<App />);
    expect(rootTheme()).toBe('dark');
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
  });

  it('is light when the OS prefers light', () => {
    stubMatchMedia(false);
    render(<App />);
    expect(rootTheme()).toBe('light');
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
  });

  it('is light when matchMedia is absent', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(getInitialTheme()).toBe('light');
    render(<App />);
    expect(rootTheme()).toBe('light');
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('theme toggle', () => {
  it('flips data-theme and aria-pressed each click', () => {
    stubMatchMedia(false);
    render(<App />);
    fireEvent.click(toggle());
    expect(rootTheme()).toBe('dark');
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(toggle());
    expect(rootTheme()).toBe('light');
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
  });

  it('has no data-action so it is not a counter button', () => {
    stubMatchMedia(false);
    render(<App />);
    expect(toggle()).not.toHaveAttribute('data-action');
    expect(toggle()).toHaveClass('theme-toggle');
    expect(document.querySelectorAll('button[data-action]')).toHaveLength(5);
  });

  it('does not change the counter value or click tally', () => {
    stubMatchMedia(false);
    render(<App />);
    fireEvent.click(document.querySelector('[data-action="ADD_FOUR"]'));
    const value = document.getElementById('d').textContent;
    const title = document.getElementById('ttl').textContent;
    fireEvent.click(toggle());
    fireEvent.click(toggle());
    expect(document.getElementById('d').textContent).toBe(value);
    expect(document.getElementById('ttl').textContent).toBe(title);
    expect(title).toBe('Counter (1 clicks)');
  });

  it('does not persist the theme', () => {
    stubMatchMedia(false);
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<App />);
    fireEvent.click(toggle());
    expect(setItem).not.toHaveBeenCalled();
    expect(document.cookie).toBe('');
    setItem.mockRestore();
  });
});
