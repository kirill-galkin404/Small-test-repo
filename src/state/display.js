export function getTitle(clickCount) {
  return `Counter (${clickCount} clicks)`;
}

export function getColor(value) {
  if (value > 10) {
    return "var(--color-value-high)";
  }
  if (value < 0) {
    return "var(--color-value-low)";
  }
  return "var(--color-value-default)";
}
