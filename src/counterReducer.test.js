import { describe, it, expect, vi, afterEach } from "vitest";
import { ACTION, counterReducer, initialState } from "./counterReducer";

afterEach(() => vi.restoreAllMocks());

describe("counterReducer", () => {
  it("has the expected initial state and frozen ACTION", () => {
    expect(initialState).toEqual({ value: 0, clickCount: 0 });
    expect(Object.keys(ACTION)).toEqual(["INCREMENT", "DECREMENT", "RESET", "ADD_FOUR", "DOUBLE"]);
    expect(Object.isFrozen(ACTION)).toBe(true);
  });

  it("INCREMENT adds 1", () => {
    expect(counterReducer({ value: 5, clickCount: 0 }, { type: ACTION.INCREMENT }).value).toBe(6);
  });

  it("DECREMENT subtracts 1 and can go negative", () => {
    expect(counterReducer({ value: 5, clickCount: 0 }, { type: ACTION.DECREMENT }).value).toBe(4);
    expect(counterReducer({ value: 0, clickCount: 0 }, { type: ACTION.DECREMENT }).value).toBe(-1);
  });

  it("RESET sets value to 0 but keeps counting clicks", () => {
    expect(counterReducer({ value: 42, clickCount: 3 }, { type: ACTION.RESET })).toEqual({ value: 0, clickCount: 4 });
    expect(counterReducer({ value: -7, clickCount: 0 }, { type: ACTION.RESET }).value).toBe(0);
  });

  it("ADD_FOUR adds 4", () => {
    expect(counterReducer({ value: 1, clickCount: 0 }, { type: ACTION.ADD_FOUR }).value).toBe(5);
    expect(counterReducer({ value: -10, clickCount: 0 }, { type: ACTION.ADD_FOUR }).value).toBe(-6);
  });

  it("DOUBLE multiplies by 2", () => {
    expect(counterReducer({ value: 3, clickCount: 0 }, { type: ACTION.DOUBLE }).value).toBe(6);
    expect(counterReducer({ value: -3, clickCount: 0 }, { type: ACTION.DOUBLE }).value).toBe(-6);
    expect(counterReducer({ value: 0, clickCount: 0 }, { type: ACTION.DOUBLE }).value).toBe(0);
  });

  it("increments clickCount by one for every known action", () => {
    for (const type of Object.values(ACTION)) {
      expect(counterReducer({ value: 2, clickCount: 9 }, { type }).clickCount).toBe(10);
    }
  });

  it("does not mutate the input state", () => {
    const state = Object.freeze({ value: 1, clickCount: 1 });
    expect(() => counterReducer(state, { type: ACTION.INCREMENT })).not.toThrow();
    expect(state).toEqual({ value: 1, clickCount: 1 });
  });

  it("warns and returns the same state for unknown actions", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const state = { value: 3, clickCount: 2 };
    for (const type of [undefined, 99, "BOGUS"]) {
      expect(counterReducer(state, { type })).toBe(state);
    }
    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledWith("dispatch: unrecognized action", 99);
    expect(state).toEqual({ value: 3, clickCount: 2 });
  });
});
