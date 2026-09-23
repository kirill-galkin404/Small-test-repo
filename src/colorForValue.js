export function colorForValue(value) {
  if (value > 10) return 'high'
  if (value < 0) return 'low'
  return 'normal'
}
