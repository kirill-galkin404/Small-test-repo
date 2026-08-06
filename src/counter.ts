// GENERATED FILE — edit src/counter.ts instead
const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 } as const);
type ActionCode = typeof ACTION[keyof typeof ACTION];

var c = 0;
var cc = 0; // cc counts every dispatched action, shown as clicks in the title

var counterEl = document.getElementById("counter");
if(counterEl instanceof HTMLElement){
  counterEl.addEventListener("click", function(event){
    var target = event.target;
    if(!(target instanceof HTMLElement)){
      return;
    }
    var action = target.dataset.action;
    if(!action){
      return;
    }
    dispatch(ACTION[action as keyof typeof ACTION]);
  });
}

function dispatch(x: ActionCode | undefined): void {
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

function render(): void {
  var d = document.getElementById("d");
  if(d instanceof HTMLElement){
    d.innerHTML = String(c);
    if(c > 10){
      d.style.color = "red"
    } else if(c < 0){
      d.style.color = "blue"
    } else {
      d.style.color = "black"
    }
  }

  // update title
  var ttl = document.getElementById("ttl");
  if(ttl instanceof HTMLElement){
    ttl.innerHTML = "Counter (" + cc + " clicks)"
  }
}
