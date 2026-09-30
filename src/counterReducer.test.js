import { describe, it, expect } from 'vitest';
import { counterReducer } from './counterReducer';

const initialState = { value: 0, clicks: 0 };

describe('counterReducer', () => {
  describe('INCREMENT (R-0006)', () => {
    it('increases value by 1', () => {
      const result = counterReducer(initialState, { type: 'INCREMENT' });
      expect(result.value).toBe(1);
    });

    it('increments clicks', () => {
      const result = counterReducer(initialState, { type: 'INCREMENT' });
      expect(result.clicks).toBe(1);
    });
  });

  describe('DECREMENT (R-0007)', () => {
    it('decreases value by 1', () => {
      const result = counterReducer({ value: 5, clicks: 0 }, { type: 'DECREMENT' });
      expect(result.value).toBe(4);
    });

    it('increments clicks', () => {
      const result = counterReducer({ value: 5, clicks: 0 }, { type: 'DECREMENT' });
      expect(result.clicks).toBe(1);
    });

    it('has no lower bound and can go negative', () => {
      const result = counterReducer({ value: 0, clicks: 0 }, { type: 'DECREMENT' });
      expect(result.value).toBe(-1);
    });

    it('can go further negative from an already-negative value', () => {
      const result = counterReducer({ value: -5, clicks: 3 }, { type: 'DECREMENT' });
      expect(result.value).toBe(-6);
      expect(result.clicks).toBe(4);
    });
  });

  describe('RESET (R-0008)', () => {
    it('sets value to 0 from a positive value', () => {
      const result = counterReducer({ value: 42, clicks: 0 }, { type: 'RESET' });
      expect(result.value).toBe(0);
    });

    it('sets value to 0 from a negative value', () => {
      const result = counterReducer({ value: -7, clicks: 0 }, { type: 'RESET' });
      expect(result.value).toBe(0);
    });

    it('sets value to 0 when already 0', () => {
      const result = counterReducer({ value: 0, clicks: 2 }, { type: 'RESET' });
      expect(result.value).toBe(0);
    });

    it('increments clicks regardless of starting value', () => {
      const result = counterReducer({ value: 42, clicks: 1 }, { type: 'RESET' });
      expect(result.clicks).toBe(2);
    });
  });

  describe('ADD_FOUR (R-0009)', () => {
    it('adds 4 to the value in a single step', () => {
      const result = counterReducer({ value: 3, clicks: 0 }, { type: 'ADD_FOUR' });
      expect(result.value).toBe(7);
    });

    it('increments clicks', () => {
      const result = counterReducer({ value: 3, clicks: 0 }, { type: 'ADD_FOUR' });
      expect(result.clicks).toBe(1);
    });
  });

  describe('DOUBLE (R-0010)', () => {
    it('multiplies the current value by 2', () => {
      const result = counterReducer({ value: 6, clicks: 0 }, { type: 'DOUBLE' });
      expect(result.value).toBe(12);
    });

    it('increments clicks', () => {
      const result = counterReducer({ value: 6, clicks: 0 }, { type: 'DOUBLE' });
      expect(result.clicks).toBe(1);
    });

    it('doubling a negative value keeps it negative', () => {
      const result = counterReducer({ value: -3, clicks: 0 }, { type: 'DOUBLE' });
      expect(result.value).toBe(-6);
    });

    it('doubling 0 stays 0', () => {
      const result = counterReducer({ value: 0, clicks: 1 }, { type: 'DOUBLE' });
      expect(result.value).toBe(0);
      expect(result.clicks).toBe(2);
    });
  });

  describe('unrecognized actions (R-0002)', () => {
    it('leaves the counter value unchanged', () => {
      const state = { value: 5, clicks: 2 };
      const result = counterReducer(state, { type: 'NOT_A_REAL_ACTION' });
      expect(result.value).toBe(5);
    });

    it('does not increment the click counter', () => {
      const state = { value: 5, clicks: 2 };
      const result = counterReducer(state, { type: 'NOT_A_REAL_ACTION' });
      expect(result.clicks).toBe(2);
    });

    it('returns the exact same state reference (no re-render should be triggered)', () => {
      const state = { value: 5, clicks: 2 };
      const result = counterReducer(state, { type: 'NOT_A_REAL_ACTION' });
      expect(result).toBe(state);
    });

    it('is a no-op even with a missing/undefined action type', () => {
      const state = { value: 5, clicks: 2 };
      const result = counterReducer(state, {});
      expect(result).toBe(state);
    });
  });
});
