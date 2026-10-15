// Parity cases derived from legacy counter.js semantics. Pure data, no imports.
// Legacy: +1, -1, reset to 0, +4, doubled, no bounds; clicks +1 for every recognised
// action (including RESET, which keeps the tally); unrecognised actions change nothing.

export const actionCases = [
  { name: 'INCREMENT adds one', type: 'INCREMENT', start: { value: 0, clicks: 0 }, expected: { value: 1, clicks: 1 } },
  { name: 'INCREMENT from negative', type: 'INCREMENT', start: { value: -1, clicks: 4 }, expected: { value: 0, clicks: 5 } },
  { name: 'INCREMENT crosses 10 without bound', type: 'INCREMENT', start: { value: 10, clicks: 3 }, expected: { value: 11, clicks: 4 } },
  { name: 'DECREMENT subtracts one', type: 'DECREMENT', start: { value: 5, clicks: 1 }, expected: { value: 4, clicks: 2 } },
  { name: 'DECREMENT goes below zero without bound', type: 'DECREMENT', start: { value: 0, clicks: 0 }, expected: { value: -1, clicks: 1 } },
  { name: 'RESET sets value to zero', type: 'RESET', start: { value: 9, clicks: 0 }, expected: { value: 0, clicks: 1 } },
  { name: 'RESET keeps the tally and counts as a click', type: 'RESET', start: { value: 5, clicks: 2 }, expected: { value: 0, clicks: 3 } },
  { name: 'RESET from negative', type: 'RESET', start: { value: -7, clicks: 6 }, expected: { value: 0, clicks: 7 } },
  { name: 'ADD_FOUR adds four', type: 'ADD_FOUR', start: { value: 1, clicks: 0 }, expected: { value: 5, clicks: 1 } },
  { name: 'ADD_FOUR from negative', type: 'ADD_FOUR', start: { value: -6, clicks: 2 }, expected: { value: -2, clicks: 3 } },
  { name: 'DOUBLE doubles', type: 'DOUBLE', start: { value: 3, clicks: 0 }, expected: { value: 6, clicks: 1 } },
  { name: 'DOUBLE of negative (-3 to -6)', type: 'DOUBLE', start: { value: -3, clicks: 0 }, expected: { value: -6, clicks: 1 } },
  { name: 'DOUBLE of zero stays zero but counts a click', type: 'DOUBLE', start: { value: 0, clicks: 4 }, expected: { value: 0, clicks: 5 } },
  { name: 'DOUBLE crosses 10 without bound', type: 'DOUBLE', start: { value: 8, clicks: 1 }, expected: { value: 16, clicks: 2 } },
]

export const unknownCases = [
  { name: "unknown key 'toString' is ignored", type: 'toString', start: { value: 3, clicks: 2 } },
  { name: "unknown key 'NOPE' is ignored", type: 'NOPE', start: { value: 3, clicks: 2 } },
  { name: "unknown key 'constructor' is ignored", type: 'constructor', start: { value: -2, clicks: 5 } },
  { name: "unknown key '__proto__' is ignored", type: '__proto__', start: { value: 0, clicks: 0 } },
  { name: 'lower-case key is ignored', type: 'increment', start: { value: 1, clicks: 1 } },
  { name: 'empty key is ignored', type: '', start: { value: 1, clicks: 1 } },
]

export const toneCases = [
  { value: 11, tone: 'high' },
  { value: 10, tone: 'default' },
  { value: 0, tone: 'default' },
  { value: -1, tone: 'negative' },
  { value: 1, tone: 'default' },
  { value: 100, tone: 'high' },
  { value: -100, tone: 'negative' },
]

export const headingCases = [
  { clicks: 0, heading: 'Counter' },
  { clicks: 1, heading: 'Counter (1 clicks)' },
  { clicks: 7, heading: 'Counter (7 clicks)' },
  { clicks: 25, heading: 'Counter (25 clicks)' },
]
