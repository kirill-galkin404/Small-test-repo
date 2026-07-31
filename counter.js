const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
var c = 0
var cc = 0 // cc counts every dispatched action, shown as clicks in the title

;(function checkActionWiring(){
  var mismatches = []
  var triggers = document.querySelectorAll("#counter [data-action]")
  for(var i = 0; i < triggers.length; i++){
    var value = triggers[i].dataset.action
    if(!Object.prototype.hasOwnProperty.call(ACTION, value)){
      mismatches.push("<" + triggers[i].tagName.toLowerCase() + "> data-action=\"" + value + "\"")
    }
  }
  if(mismatches.length){
    console.error("Counter: data-action/ACTION mismatch for " + mismatches.length + " element(s): " + mismatches.join(", ") + " — check counter.html's data-action attributes against the ACTION table in counter.js")
  }
})();

document.getElementById("counter").addEventListener("click", function(event){
  var trigger = event.target.closest("[data-action]")
  if(!trigger || !event.currentTarget.contains(trigger)){
    return;
  }
  var action = trigger.dataset.action
  if(!action){
    throw new Error("Counter: trigger element has no usable data-action (<" + trigger.tagName.toLowerCase() + (trigger.className ? " class=\"" + trigger.className + "\"" : "") + ">)")
  }
  dispatch(ACTION[action])
});

function dispatch(x){
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
      throw new Error("dispatch(): unknown ACTION code " + x + " — check the ACTION table against the data-action attributes in counter.html")
  }

  cc++
  console.log("dispatch: cc incremented to", cc)
  render()
}

function render(){
  document.getElementById("d").innerHTML = c
  if(c > 10){
    document.getElementById("d").style.color = "red"
  } else if(c < 0){
    document.getElementById("d").style.color = "blue"
  } else {
    document.getElementById("d").style.color = "black"
  }

  // update title
  document.getElementById("ttl").innerHTML = "Counter (" + cc + " clicks)"
}
