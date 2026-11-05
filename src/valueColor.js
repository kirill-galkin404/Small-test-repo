export function valueColor(value) {
  if (value > 10) return 'red';
  if (value < 0) return 'blue';
  return 'black';
}
