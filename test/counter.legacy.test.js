/**
 * Baseline conformance tests against the UNMODIFIED counter.js / counter.html.
 *
 * These tests load the real, on-disk counter.html and counter.js (no
 * modification) into a jsdom window and drive them via real DOM click
 * events, asserting the behavior documented in RULES.md. This suite must
 * pass against the original vanilla-JS implementation, BEFORE any React
 * rewrite happens in later stages, to prove RULES.md matches shipped
 * behavior.
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

function loadCounterDom() {
  const htmlPath = path.resolve(__dirname, "..", "counter.html");
  const jsPath = path.resolve(__dirname, "..", "counter.js");

  const html = fs.readFileSync(htmlPath, "utf8");
  const js = fs.readFileSync(jsPath, "utf8");

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: "http://localhost/counter.html",
  });

  // Execute the unmodified counter.js source directly in the jsdom window,
  // so the top-level addEventListener registration runs against this
  // document (avoids relying on <script src> network/file fetching).
  dom.window.eval(js);

  return dom;
}

function click(dom, element) {
  const event = new dom.window.MouseEvent("click", { bubbles: true, cancelable: true });
  element.dispatchEvent(event);
}

function getDisplay(dom) {
  return dom.window.document.getElementById("d");
}

function getTitle(dom) {
  return dom.window.document.getElementById("ttl");
}

function getButton(dom, action) {
  return dom.window.document.querySelector('[data-action="' + action + '"]');
}

describe("counter.js legacy conformance (unmodified implementation)", () => {
  let dom;

  beforeEach(() => {
    dom = loadCounterDom();
  });

  test("initial render: #d is 0, #ttl shows 0 clicks", () => {
    expect(getDisplay(dom).innerHTML).toBe("0");
    expect(getTitle(dom).innerHTML).toBe("Counter");
  });

  test("R-0001 INCREMENT: clicking + once sets #d to 1, cc to 1 click", () => {
    click(dom, getButton(dom, "INCREMENT"));
    expect(getDisplay(dom).innerHTML).toBe("1");
    expect(getTitle(dom).innerHTML).toBe("Counter (1 clicks)");
  });

  test("R-0004 ADD_FOUR: clicking +4 sets #d to 4", () => {
    click(dom, getButton(dom, "ADD_FOUR"));
    expect(getDisplay(dom).innerHTML).toBe("4");
    expect(getTitle(dom).innerHTML).toBe("Counter (1 clicks)");
  });

  test("R-0005 DOUBLE: from 4, clicking x2 sets #d to 8", () => {
    click(dom, getButton(dom, "ADD_FOUR")); // c=4, cc=1
    click(dom, getButton(dom, "DOUBLE")); // c=8, cc=2
    expect(getDisplay(dom).innerHTML).toBe("8");
    expect(getTitle(dom).innerHTML).toBe("Counter (2 clicks)");
  });

  test("R-0002 DECREMENT: from 8, clicking - sets #d to 7", () => {
    click(dom, getButton(dom, "ADD_FOUR")); // c=4, cc=1
    click(dom, getButton(dom, "DOUBLE")); // c=8, cc=2
    click(dom, getButton(dom, "DECREMENT")); // c=7, cc=3
    expect(getDisplay(dom).innerHTML).toBe("7");
    expect(getTitle(dom).innerHTML).toBe("Counter (3 clicks)");
  });

  test("R-0003 RESET: from 7, clicking reset sets #d to 0 and still increments cc", () => {
    click(dom, getButton(dom, "ADD_FOUR")); // c=4, cc=1
    click(dom, getButton(dom, "DOUBLE")); // c=8, cc=2
    click(dom, getButton(dom, "DECREMENT")); // c=7, cc=3
    click(dom, getButton(dom, "RESET")); // c=0, cc=4
    expect(getDisplay(dom).innerHTML).toBe("0");
    expect(getTitle(dom).innerHTML).toBe("Counter (4 clicks)");
  });

  test("R-0006 color thresholds: c=11 is red", () => {
    for (let i = 0; i < 11; i++) {
      click(dom, getButton(dom, "INCREMENT"));
    }
    expect(getDisplay(dom).innerHTML).toBe("11");
    expect(getDisplay(dom).style.color).toBe("red");
  });

  test("R-0006 color thresholds: c=-1 is blue", () => {
    click(dom, getButton(dom, "DECREMENT"));
    expect(getDisplay(dom).innerHTML).toBe("-1");
    expect(getDisplay(dom).style.color).toBe("blue");
  });

  test("R-0006 color thresholds: c=0 boundary is black", () => {
    // land exactly on 0 via increment then decrement
    click(dom, getButton(dom, "INCREMENT")); // c=1
    click(dom, getButton(dom, "DECREMENT")); // c=0
    expect(getDisplay(dom).innerHTML).toBe("0");
    expect(getDisplay(dom).style.color).toBe("black");
  });

  test("R-0006 color thresholds: c=10 boundary is black", () => {
    for (let i = 0; i < 10; i++) {
      click(dom, getButton(dom, "INCREMENT"));
    }
    expect(getDisplay(dom).innerHTML).toBe("10");
    expect(getDisplay(dom).style.color).toBe("black");
  });

  test("R-0007 no-op click: clicking an element with no data-action (#ttl) leaves #d and #ttl unchanged", () => {
    click(dom, getButton(dom, "INCREMENT")); // c=1, cc=1
    const dBefore = getDisplay(dom).innerHTML;
    const ttlBefore = getTitle(dom).innerHTML;

    click(dom, getTitle(dom)); // #ttl has no data-action attribute

    expect(getDisplay(dom).innerHTML).toBe(dBefore);
    expect(getTitle(dom).innerHTML).toBe(ttlBefore);
    expect(getDisplay(dom).innerHTML).toBe("1");
    expect(getTitle(dom).innerHTML).toBe("Counter (1 clicks)");
  });

  test("R-0008 dispatch counting: cc increments once per successful dispatch, including RESET, and never resets", () => {
    click(dom, getButton(dom, "INCREMENT")); // cc=1
    click(dom, getButton(dom, "INCREMENT")); // cc=2
    click(dom, getButton(dom, "RESET")); // c=0, cc=3
    expect(getTitle(dom).innerHTML).toBe("Counter (3 clicks)");
    click(dom, getButton(dom, "RESET")); // c=0, cc=4
    expect(getTitle(dom).innerHTML).toBe("Counter (4 clicks)");
  });
});
