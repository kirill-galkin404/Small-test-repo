"use strict";
// GENERATED FILE NOTICE: counter.js is compiled from this file via
// `tsc -p tsconfig.json` (see tsconfig.json: "module": "none" + "outFile").
// Do not hand-edit counter.js — edit counter.ts and recompile.
//
// NOTE (ADR 0001): this file must stay free of ES module syntax (the
// `import`/`export` keywords) and of any shared types/helper module — all
// types and helpers are kept inline. Introducing ES module syntax
// (import/export) is an ADR-0001-level decision, not a refactor, because it
// silently breaks the classic-script emit path (see tsconfig.json's
// "module": "none" + "outFile", which requires a module-syntax-free source
// to emit a flat, non-module counter.js).
const ACTION = Object.freeze({ INCREMENT: 1, DECREMENT: 2, RESET: 3, ADD_FOUR: 4, DOUBLE: 5 });
let c = 0;
let cc = 0; // cc counts every dispatched action, shown as clicks in the title
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
    document.getElementById("d").innerHTML = c.toString();
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
