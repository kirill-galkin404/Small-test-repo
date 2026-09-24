/**
 * Frozen enum of the 5 dispatchable action types for the counter widget.
 * Values are exactly as documented in RULES.md §2.
 */
export const ACTION = Object.freeze({
  INCREMENT: 1,
  DECREMENT: 2,
  RESET: 3,
  ADD_FOUR: 4,
  DOUBLE: 5,
});

/**
 * @typedef {typeof ACTION[keyof typeof ACTION]} Action
 */
