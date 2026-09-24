const ACTION: { [key: string]: number } = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
var c = 0
var cc = 0 // cc counts every dispatched action, shown as clicks in the title

var counterEl = document.getElementById("counter")
if(counterEl){
  counterEl.addEventListener("click", function(event){
    var action = (event.target as HTMLElement).dataset.action
    if(!action){
      return;
    }
    dispatch(ACTION[action])
  });
}

function dispatch(x: number){
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
  var dEl = document.getElementById("d")
  if(dEl){
    dEl.innerHTML = String(c)
    if(c > 10){
      dEl.style.color = "red"
    } else if(c < 0){
      dEl.style.color = "blue"
    } else {
      dEl.style.color = "black"
    }
  }

  // update title
  var ttlEl = document.getElementById("ttl")
  if(ttlEl){
    ttlEl.innerHTML = "Counter (" + cc + " clicks)"
  }
}
