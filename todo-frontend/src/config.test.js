import { describe, it, expect } from 'vitest';
import { API_URL } from './config';

describe('config', () => {
  it('defaults API_URL to the local backend', () => {
    expect(API_URL).toBe('http://localhost:3000/api');
  });
});
