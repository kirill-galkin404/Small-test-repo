import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fromNow, prettyDate, priorityLabel } from './format';

describe('fromNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns empty string for empty input', () => {
    expect(fromNow('')).toBe('');
    expect(fromNow(null)).toBe('');
    expect(fromNow(undefined)).toBe('');
  });

  it('returns a relative string', () => {
    expect(fromNow('2024-06-15T11:00:00Z')).toBe('an hour ago');
    expect(fromNow('2024-06-13T12:00:00Z')).toBe('2 days ago');
  });
});

describe('prettyDate', () => {
  it('returns empty string for empty input', () => {
    expect(prettyDate('')).toBe('');
    expect(prettyDate(null)).toBe('');
  });

  it("formats as 'MMM D, YYYY'", () => {
    expect(prettyDate('2024-03-05T12:00:00')).toBe('Mar 5, 2024');
    expect(prettyDate('2023-12-25T12:00:00')).toBe('Dec 25, 2023');
  });
});

describe('priorityLabel', () => {
  it('maps 3, 2, 1', () => {
    expect(priorityLabel(3)).toBe('High');
    expect(priorityLabel(2)).toBe('Normal');
    expect(priorityLabel(1)).toBe('Low');
  });

  it("maps anything else to '?'", () => {
    expect(priorityLabel(0)).toBe('?');
    expect(priorityLabel(4)).toBe('?');
    expect(priorityLabel(undefined)).toBe('?');
    expect(priorityLabel('x')).toBe('?');
  });
});
