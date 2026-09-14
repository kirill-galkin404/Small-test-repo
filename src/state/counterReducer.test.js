import { describe, it, expect, vi, beforeEach } from "vitest";
import { counterReducer, initialState } from "./counterReducer";
import { getColor } from "./display";

describe("counterReducer", () => {
  it("INCREMENT increases value by 1 and increments clickCount", () => {
    const state = { value: 5, clickCount: 2 };
    const next = counterReducer(state, { type: "INCREMENT" });
    expect(next).toEqual({ value: 6, clickCount: 3 });
  });

  it("DECREMENT decreases value by 1 and increments clickCount", () => {
    const state = { value: 5, clickCount: 2 };
    const next = counterReducer(state, { type: "DECREMENT" });
    expect(next).toEqual({ value: 4, clickCount: 3 });
  });

  it("RESET sets value to 0 and increments clickCount", () => {
    const state = { value: 42, clickCount: 7 };
    const next = counterReducer(state, { type: "RESET" });
    expect(next).toEqual({ value: 0, clickCount: 8 });
  });

  it("ADD_FOUR adds 4 to value and increments clickCount", () => {
    const state = { value: 5, clickCount: 2 };
    const next = counterReducer(state, { type: "ADD_FOUR" });
    expect(next).toEqual({ value: 9, clickCount: 3 });
  });

  it("DOUBLE multiplies value by 2 and increments clickCount", () => {
    const state = { value: 5, clickCount: 2 };
    const next = counterReducer(state, { type: "DOUBLE" });
    expect(next).toEqual({ value: 10, clickCount: 3 });
  });

  it("starts from the documented initialState", () => {
    expect(initialState).toEqual({ value: 0, clickCount: 0 });
  });

  describe("unrecognized action", () => {
    beforeEach(() => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("leaves state unchanged and warns for an unrecognized action", () => {
      const state = { value: 5, clickCount: 2 };
      const next = counterReducer(state, { type: "NOT_A_REAL_ACTION" });

      expect(next).toEqual(state);
      expect(next.value).toBe(state.value);
      expect(next.clickCount).toBe(state.clickCount);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});

describe("getColor thresholds", () => {
  it("returns the high color token for values above 10", () => {
    expect(getColor(11)).toBe("var(--color-value-high)");
    expect(getColor(100)).toBe("var(--color-value-high)");
  });

  it("returns the low color token for negative values", () => {
    expect(getColor(-1)).toBe("var(--color-value-low)");
    expect(getColor(-100)).toBe("var(--color-value-low)");
  });

  it("returns the default color token for values in range [0, 10]", () => {
    expect(getColor(0)).toBe("var(--color-value-default)");
    expect(getColor(10)).toBe("var(--color-value-default)");
    expect(getColor(-0)).toBe("var(--color-value-default)");
  });
});
