"use strict";
const ACTION = Object.freeze({
    INCREMENT: 1,
    DECREMENT: 2,
    RESET: 3,
    ADD_FOUR: 4,
    DOUBLE: 5,
});
var c = 0;
var cc = 0; // cc counts every dispatched action, shown as clicks in the title
var counterEl = document.getElementById("counter");
if (!counterEl) {
    throw new Error("missing #counter element");
}
counterEl.addEventListener("click", function (event) {
    if (!(event.target instanceof HTMLElement)) {
        return;
    }
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
            c = c + 1;
            break;
        case ACTION.DECREMENT:
            console.log("dispatch: ACTION.DECREMENT");
            c = c - 1;
            break;
        case ACTION.RESET:
            console.log("dispatch: ACTION.RESET");
            c = 0;
            break;
        case ACTION.ADD_FOUR:
            console.log("dispatch: ACTION.ADD_FOUR");
            c = c + 4;
            break;
        case ACTION.DOUBLE:
            console.log("dispatch: ACTION.DOUBLE");
            c = c * 2;
            break;
        default:
            console.warn("dispatch: unrecognized action", x);
            return;
    }
    cc++;
    console.log("dispatch: cc incremented to", cc);
    render();
}
function render() {
    var d = document.getElementById("d");
    if (!d) {
        throw new Error("missing #d element");
    }
    d.innerHTML = String(c);
    if (c > 10) {
        d.style.color = "red";
    }
    else if (c < 0) {
        d.style.color = "blue";
    }
    else {
        d.style.color = "black";
    }
    // update title
    var ttl = document.getElementById("ttl");
    if (!ttl) {
        throw new Error("missing #ttl element");
    }
    ttl.innerHTML = "Counter (" + cc + " clicks)";
}
