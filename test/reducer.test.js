import { describe, it, expect, vi } from "vitest";
import { reducer, colourFor, ACTION } from "../src/reducer.js";

describe("reducer", () => {
  it("INCREMENT increases c by 1 and increments cc", () => {
    expect(reducer({ c: 0, cc: 0 }, ACTION.INCREMENT)).toEqual({ c: 1, cc: 1 });
    expect(reducer({ c: 5, cc: 2 }, ACTION.INCREMENT)).toEqual({ c: 6, cc: 3 });
  });

  it("DECREMENT decreases c by 1 and increments cc", () => {
    expect(reducer({ c: 0, cc: 0 }, ACTION.DECREMENT)).toEqual({ c: -1, cc: 1 });
    expect(reducer({ c: 5, cc: 2 }, ACTION.DECREMENT)).toEqual({ c: 4, cc: 3 });
  });

  it("RESET sets c to 0 and increments cc", () => {
    expect(reducer({ c: 7, cc: 2 }, ACTION.RESET)).toEqual({ c: 0, cc: 3 });
    expect(reducer({ c: -3, cc: 0 }, ACTION.RESET)).toEqual({ c: 0, cc: 1 });
  });

  it("ADD_FOUR increases c by 4 and increments cc", () => {
    expect(reducer({ c: 0, cc: 0 }, ACTION.ADD_FOUR)).toEqual({ c: 4, cc: 1 });
    expect(reducer({ c: 3, cc: 2 }, ACTION.ADD_FOUR)).toEqual({ c: 7, cc: 3 });
  });

  it("DOUBLE doubles c and increments cc", () => {
    expect(reducer({ c: 3, cc: 0 }, ACTION.DOUBLE)).toEqual({ c: 6, cc: 1 });
    expect(reducer({ c: -2, cc: 2 }, ACTION.DOUBLE)).toEqual({ c: -4, cc: 3 });
  });

  it("returns identical state and warns on an unrecognized action, without throwing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const state = { c: 5, cc: 2 };

    expect(() => reducer(state, "NOT_A_REAL_ACTION")).not.toThrow();
    const result = reducer(state, "NOT_A_REAL_ACTION");

    expect(result).toEqual({ c: 5, cc: 2 });
    expect(result).toBe(state);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  describe("colourFor", () => {
    it("is black at the boundary c=10", () => {
      expect(colourFor(10)).toBe("black");
    });

    it("is red just above the boundary, c=11", () => {
      expect(colourFor(11)).toBe("red");
    });

    it("is black at the boundary c=0", () => {
      expect(colourFor(0)).toBe("black");
    });

    it("is blue just below the boundary, c=-1", () => {
      expect(colourFor(-1)).toBe("blue");
    });
  });
});
