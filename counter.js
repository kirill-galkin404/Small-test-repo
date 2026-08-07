"use strict";
const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
const state = { c: 0, cc: 0 };
document.getElementById("counter").addEventListener("click", function (event) {
    var action = event.target.dataset.action;
    if (!action) {
        return;
    }
    dispatch(ACTION[action]);
});
function dispatch(x) {
    // main logic
    switch (x) {
        case ACTION.INCREMENT:
            console.log("dispatch: ACTION.INCREMENT");
            state.c = state.c + 1;
            break;
        case ACTION.DECREMENT:
            console.log("dispatch: ACTION.DECREMENT");
            state.c = state.c - 1;
            break;
        case ACTION.RESET:
            console.log("dispatch: ACTION.RESET");
            state.c = 0;
            break;
        case ACTION.ADD_FOUR:
            console.log("dispatch: ACTION.ADD_FOUR");
            state.c = state.c + 4;
            break;
        case ACTION.DOUBLE:
            console.log("dispatch: ACTION.DOUBLE");
            state.c = state.c * 2;
            break;
        default:
            console.warn("dispatch: unrecognized action", x);
            return;
    }
    state.cc++;
    console.log("dispatch: cc incremented to", state.cc);
    render();
}
function render() {
    document.getElementById("d").innerHTML = String(state.c);
    if (state.c > 10) {
        document.getElementById("d").style.color = "red";
    }
    else if (state.c < 0) {
        document.getElementById("d").style.color = "blue";
    }
    else {
        document.getElementById("d").style.color = "black";
    }
    // update title
    document.getElementById("ttl").innerHTML = "Counter (" + state.cc + " clicks)";
}
