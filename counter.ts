// Document.getElementById is redeclared as returning a non-nullable
// HTMLElement because every id this file looks up ("counter", "d", "ttl")
// is guaranteed to exist in counter.html. render() still checks the
// looked-up elements defensively before using them.
interface Document {
  getElementById(elementId: string): HTMLElement;
}

const ACTION = Object.freeze({
  INCREMENT: 1,
  DECREMENT: 2,
  RESET: 3,
  ADD_FOUR: 4,
  DOUBLE: 5,
} as const);

type ActionCode = typeof ACTION[keyof typeof ACTION];

var c = 0
var cc = 0 // cc counts every dispatched action, shown as clicks in the title

function isActionKey(action: string): action is keyof typeof ACTION {
  return action in ACTION;
}

document.getElementById("counter").addEventListener("click", function(event){
  var target = event.target as HTMLElement
  var action = target.dataset.action
  if(!action){
    return;
  }
  dispatch(isActionKey(action) ? ACTION[action] : undefined)
});

function dispatch(x: ActionCode | undefined){
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
  var d = document.getElementById("d")
  if(d){
    d.innerHTML = String(c)
    if(c > 10){
      d.style.color = "red"
    } else if(c < 0){
      d.style.color = "blue"
    } else {
      d.style.color = "black"
    }
  }

  // update title
  var ttl = document.getElementById("ttl")
  if(ttl){
    ttl.innerHTML = "Counter (" + cc + " clicks)"
  }
}
