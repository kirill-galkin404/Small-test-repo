// Semantic color state per RULES.md R-0004.
// Maps a counter value to a semantic state name (not a CSS class or hex color).
export function displayColor(value) {
  if (value > 10) {
    return 'positive-high';
  } else if (value < 0) {
    return 'negative';
  } else {
    return 'neutral';
  }
}
