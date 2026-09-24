import { describe, it, expect } from 'vitest';
import { formatDisplay, formatTitle } from './formatter.js';

describe('formatDisplay', () => {
  it('returns "red" when value is greater than 10', () => {
    expect(formatDisplay({ value: 11, clicks: 0 })).toBe('red');
    expect(formatDisplay({ value: 100, clicks: 0 })).toBe('red');
  });

  it('returns "blue" when value is less than 0', () => {
    expect(formatDisplay({ value: -1, clicks: 0 })).toBe('blue');
    expect(formatDisplay({ value: -50, clicks: 0 })).toBe('blue');
  });

  it('returns "black" otherwise (0 to 10 inclusive)', () => {
    expect(formatDisplay({ value: 0, clicks: 0 })).toBe('black');
    expect(formatDisplay({ value: 10, clicks: 0 })).toBe('black');
    expect(formatDisplay({ value: 5, clicks: 0 })).toBe('black');
  });
});

describe('formatTitle', () => {
  it('returns "Counter (N clicks)" for N = 0', () => {
    expect(formatTitle({ value: 0, clicks: 0 })).toBe('Counter (0 clicks)');
  });

  it('returns "Counter (N clicks)" for other N values', () => {
    expect(formatTitle({ value: 0, clicks: 1 })).toBe('Counter (1 clicks)');
    expect(formatTitle({ value: 0, clicks: 42 })).toBe('Counter (42 clicks)');
  });
});
