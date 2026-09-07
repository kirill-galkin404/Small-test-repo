// Pure color-threshold policy for the counter value display.
// See RULES.md for the business-rule definition this implements.

export function colorForValue(value) {
  if (value > 10) {
    return 'red'
  }
  if (value < 0) {
    return 'blue'
  }
  return 'black'
}
