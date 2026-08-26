const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 } as const);
type ActionValue = typeof ACTION[keyof typeof ACTION];

let c: number = 0
let cc: number = 0 // cc counts every dispatched action, shown as clicks in the title

const counterEl = document.getElementById("counter");
if (!counterEl) {
  throw new Error("counter: #counter element not found");
}

counterEl.addEventListener("click", function(event){
  const target = event.target as HTMLElement;
  const action = target.dataset.action
  if(!action){
    return;
  }
  if(!(action in ACTION)){
    return;
  }
  dispatch(ACTION[action as keyof typeof ACTION])
});

function dispatch(x: ActionValue | number){
  // main logic
  switch(x){
    case ACTION.INCREMENT:
      console.log("dispatch: ACTION.INCREMENT")
      c = c + 1
      break;
    case ACTION.DECREMENT:
      console.log("dispatch: ACTION.DECREMENT")
      c = c - 1
      break;
    case ACTION.RESET:
      console.log("dispatch: ACTION.RESET")
      c = 0
      break;
    case ACTION.ADD_FOUR:
      console.log("dispatch: ACTION.ADD_FOUR")
      c = c + 4
      break;
    case ACTION.DOUBLE:
      console.log("dispatch: ACTION.DOUBLE")
      c = c * 2
      break;
    default:
      console.warn("dispatch: unrecognized action", x)
      return;
  }

  cc++
  console.log("dispatch: cc incremented to", cc)
  render()
}

function render(){
  const d = document.getElementById("d");
  if (!d) {
    throw new Error("counter: #d element not found");
  }
  d.innerHTML = String(c)
  if(c > 10){
    d.style.color = "red"
  } else if(c < 0){
    d.style.color = "blue"
  } else {
    d.style.color = "black"
  }

  // update title
  const ttl = document.getElementById("ttl");
  if (!ttl) {
    throw new Error("counter: #ttl element not found");
  }
  ttl.innerHTML = "Counter (" + cc + " clicks)"
}
