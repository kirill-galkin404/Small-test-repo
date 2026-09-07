// Pure arithmetic rules for the counter's five actions.
// Each function takes the current counter value and returns the new value.
// See RULES.md for the business-rule definitions these implement.

export function increment(value) {
  return value + 1
}

export function decrement(value) {
  return value - 1
}

export function reset() {
  return 0
}

export function addFour(value) {
  return value + 4
}

export function double(value) {
  return value * 2
}
