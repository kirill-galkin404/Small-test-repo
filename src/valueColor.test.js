import { describe, it, expect } from 'vitest';
import { valueColor } from './valueColor.js';

describe('valueColor', () => {
  it('is red above 10', () => {
    expect(valueColor(11)).toBe('red');
    expect(valueColor(100)).toBe('red');
  });

  it('is black at 10 and 0', () => {
    expect(valueColor(10)).toBe('black');
    expect(valueColor(0)).toBe('black');
    expect(valueColor(5)).toBe('black');
  });

  it('is blue below 0', () => {
    expect(valueColor(-1)).toBe('blue');
    expect(valueColor(-50)).toBe('blue');
  });
});
