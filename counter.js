const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
var c = 0
var cc = 0 // cc counts every dispatched action, shown as clicks in the title

document.getElementById("counter").addEventListener("click", function(event){
  var action = event.target.dataset.action
  if(!action){
    return;
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
      console.warn("dispatch: unrecognized action", x)
      return;
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

// --- Theme toggle (presentation-only; never goes through dispatch()/ACTION) ---
var THEME_STORAGE_KEY = "theme"

function applyTheme(theme){
  if(theme === "dark"){
    document.documentElement.setAttribute("data-theme", "dark")
  } else {
    document.documentElement.removeAttribute("data-theme")
  }
}

function getInitialTheme(){
  var stored = null
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY)
  } catch(e) {
    console.warn("theme: localStorage unavailable", e)
  }
  if(stored === "dark" || stored === "light"){
    return stored
  }
  if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){
    return "dark"
  }
  return "light"
}

applyTheme(getInitialTheme())

document.getElementById("theme-toggle").addEventListener("click", function(){
  var isDark = document.documentElement.getAttribute("data-theme") === "dark"
  var next = isDark ? "light" : "dark"
  applyTheme(next)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch(e) {
    console.warn("theme: localStorage unavailable", e)
  }
});
