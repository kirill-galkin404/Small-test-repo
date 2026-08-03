const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
const state = { value: 0, clicks: 0 } // value is the counter's value, clicks counts every dispatched action, shown as clicks in the title

document.getElementById("counter").addEventListener("click", function(event){
  var action = event.target.dataset.action
  if(!action){
    return;
  }
  dispatch(ACTION[action])
});

function dispatch(x){
  // main logic
  if(x == null || !Object.values(ACTION).includes(x)){
    console.warn("dispatch: unrecognized action", x)
    return;
  }

  switch(x){
    case ACTION.INCREMENT:
      console.log("dispatch: ACTION.INCREMENT")
      state.value = state.value + 1
      break;
    case ACTION.DECREMENT:
      console.log("dispatch: ACTION.DECREMENT")
      state.value = state.value - 1
      break;
    case ACTION.RESET:
      console.log("dispatch: ACTION.RESET")
      state.value = 0
      break;
    case ACTION.ADD_FOUR:
      console.log("dispatch: ACTION.ADD_FOUR")
      state.value = state.value + 4
      break;
    case ACTION.DOUBLE:
      console.log("dispatch: ACTION.DOUBLE")
      state.value = state.value * 2
      break;
  }

  state.clicks++
  console.log("dispatch: clicks incremented to", state.clicks)
  render()
}

function render(){
  var d = document.getElementById("d")
  d.innerHTML = state.value
  // is-overflow/is-negative is a shared naming contract with #d's rules in style.css;
  // renaming one side without the other silently falls back to black.
  d.classList.toggle('is-overflow', state.value > 10)
  d.classList.toggle('is-negative', state.value < 0)

  // update title
  document.getElementById("ttl").innerHTML = "Counter (" + state.clicks + " clicks)"
}
