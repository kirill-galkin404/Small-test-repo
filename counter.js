// INVARIANT:
// - Action semantics (pure transformers of state.value, keyed by ACTION):
//     INCREMENT -> value + 1
//     DECREMENT -> value - 1
//     RESET     -> 0
//     ADD_FOUR  -> value + 4
//     DOUBLE    -> value * 2
// - Counting rule: state.dispatchCount increments exactly once per matched
//   dispatch (i.e. once per recognized ACTION found in TRANSFORMERS), and
//   never for an unmatched/no-op dispatch.
// - Render contract:
//     updateDisplay(value) writes `value` into #d and colors it red when
//       value > 10, blue when value < 0, black otherwise.
//     updateTitle(count) writes "Counter (" + count + " clicks)" into #ttl.
//   Both are invoked together, in that order, from render(state).
// - No-op paths (state.dispatchCount unchanged, render() not called):
//     1. A click on #counter that doesn't land on a button (the click
//        target has no data-action) — handled in the click listener below.
//     2. dispatch(x) called with an x that has no entry in TRANSFORMERS —
//        handled by the early return in dispatch(), preserving the same
//        console.warn as the original unrecognized-action case.

const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });

var state = { value: 0, dispatchCount: 0 }

var TRANSFORMERS = {}
TRANSFORMERS[ACTION.INCREMENT] = function(value){ return value + 1 }
TRANSFORMERS[ACTION.DECREMENT] = function(value){ return value - 1 }
TRANSFORMERS[ACTION.RESET] = function(value){ return 0 }
TRANSFORMERS[ACTION.ADD_FOUR] = function(value){ return value + 4 }
TRANSFORMERS[ACTION.DOUBLE] = function(value){ return value * 2 }

var ACTION_NAMES = {}
Object.keys(ACTION).forEach(function(name){ ACTION_NAMES[ACTION[name]] = name })

document.getElementById("counter").addEventListener("click", function(event){
  var action = event.target.dataset.action
  if(!action){
    return;
  }
  dispatch(ACTION[action])
});

function dispatch(x){
  var transform = TRANSFORMERS[x]
  if(!transform){
    console.warn("dispatch: unrecognized action", x)
    return;
  }

  console.log("dispatch: ACTION." + ACTION_NAMES[x])

  var prevValue = state.value
  var prevDispatchCount = state.dispatchCount

  state.value = transform(state.value)
  state.dispatchCount++

  console.log("dispatch: dispatchCount incremented to", state.dispatchCount)

  console.assert(state.dispatchCount === prevDispatchCount + 1,
    "dispatch invariant violated: dispatchCount must increment by exactly 1 per matched dispatch")
  console.assert(x !== ACTION.RESET || state.value === 0,
    "RESET invariant violated: value must be 0 after RESET")
  console.assert(x !== ACTION.INCREMENT || state.value === prevValue + 1,
    "INCREMENT invariant violated: value must increase by 1")
  console.assert(x !== ACTION.DECREMENT || state.value === prevValue - 1,
    "DECREMENT invariant violated: value must decrease by 1")
  console.assert(x !== ACTION.ADD_FOUR || state.value === prevValue + 4,
    "ADD_FOUR invariant violated: value must increase by 4")
  console.assert(x !== ACTION.DOUBLE || state.value === prevValue * 2,
    "DOUBLE invariant violated: value must double")

  render(state)
}

function render(state){
  updateDisplay(state.value)
  updateTitle(state.dispatchCount)
}

function updateDisplay(value){
  document.getElementById("d").innerHTML = value
  if(value > 10){
    document.getElementById("d").style.color = "red"
  } else if(value < 0){
    document.getElementById("d").style.color = "blue"
  } else {
    document.getElementById("d").style.color = "black"
  }
}

function updateTitle(count){
  document.getElementById("ttl").innerHTML = "Counter (" + count + " clicks)"
}
