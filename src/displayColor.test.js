import { describe, it, expect } from 'vitest';
import { displayColor } from './displayColor';

describe('displayColor (R-0004)', () => {
  it('returns "neutral" for value 0 (lower boundary of neutral range)', () => {
    expect(displayColor(0)).toBe('neutral');
  });

  it('returns "neutral" for value 10 (upper boundary of neutral range)', () => {
    expect(displayColor(10)).toBe('neutral');
  });

  it('returns "neutral" for a mid-range value', () => {
    expect(displayColor(5)).toBe('neutral');
  });

  it('returns "positive-high" for value 11 (just above the neutral range)', () => {
    expect(displayColor(11)).toBe('positive-high');
  });

  it('returns "positive-high" for a large positive value', () => {
    expect(displayColor(1000)).toBe('positive-high');
  });

  it('returns "negative" for value -1 (just below the neutral range)', () => {
    expect(displayColor(-1)).toBe('negative');
  });

  it('returns "negative" for a large negative value', () => {
    expect(displayColor(-1000)).toBe('negative');
  });
});
