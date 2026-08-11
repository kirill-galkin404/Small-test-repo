"use strict";
// counter.ts — typed source for counter.js.
// counter.js is GENERATED from this file via `tsc -p tsconfig.json`.
// Do not hand-edit counter.js; edit this file and regenerate instead.
//
// Behavioral contract: see docs/counter-ts-behavior-checklist.md.
// No import/export statements: this stays a classic global script per
// ADR-0001 (docs/adr/0001-single-file-vs-build-step.md) so that ACTION
// and dispatch remain reachable without a module loader.
const ACTION = Object.freeze({
    INCREMENT: 1,
    DECREMENT: 2,
    RESET: 3,
    ADD_FOUR: 4,
    DOUBLE: 5,
});
var c = 0;
var cc = 0; // cc counts every dispatched action, shown as clicks in the title
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
    document.getElementById("d").innerHTML = String(c);
    if (c > 10) {
        document.getElementById("d").style.color = "red";
    }
    else if (c < 0) {
        document.getElementById("d").style.color = "blue";
    }
    else {
        document.getElementById("d").style.color = "black";
    }
    // update title
    document.getElementById("ttl").innerHTML = "Counter (" + cc + " clicks)";
}
