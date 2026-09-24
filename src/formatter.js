export function formatDisplay(state) {
  if (state.value > 10) {
    return 'red'
  } else if (state.value < 0) {
    return 'blue'
  } else {
    return 'black'
  }
}

export function formatTitle(state) {
  return "Counter (" + state.clicks + " clicks)"
}
