// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "..", "counter.html");
const jsPath = path.join(__dirname, "..", "counter.js");

const html = fs.readFileSync(htmlPath, "utf8");
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
if (!bodyMatch) {
  throw new Error("counter.html is missing a <body> block");
}
// Strip the <script> tag: the script under test is loaded separately, via eval.
const bodyMarkup = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/, "");

// Read verbatim (behaviour-lock): whatever counter.js currently is, unmodified.
const source = fs.readFileSync(jsPath, "utf8");

function boot() {
  document.body.innerHTML = bodyMarkup;
  // Indirect eval runs in global scope, mirroring a classic <script> tag.
  (0, eval)(source);
}

function click(action) {
  document.querySelector(`[data-action="${action}"]`).click();
}

function display() {
  return document.getElementById("d").innerHTML;
}

function displayColor() {
  return document.getElementById("d").style.color;
}

function title() {
  return document.getElementById("ttl").innerHTML;
}

beforeEach(() => {
  boot();
});

describe("counter widget behaviour lock", () => {
  it("INCREMENT increases the displayed count", () => {
    click("INCREMENT");
    expect(display()).toBe("1");
    expect(title()).toBe("Counter (1 clicks)");
    expect(displayColor()).toBe("black");
  });

  it("DECREMENT decreases the displayed count and turns it blue", () => {
    click("DECREMENT");
    expect(display()).toBe("-1");
    expect(title()).toBe("Counter (1 clicks)");
    expect(displayColor()).toBe("blue");
  });

  it("RESET sets the count back to zero", () => {
    click("INCREMENT");
    click("INCREMENT");
    click("RESET");
    expect(display()).toBe("0");
    expect(displayColor()).toBe("black");
  });

  it("ADD_FOUR adds four to the count", () => {
    click("ADD_FOUR");
    expect(display()).toBe("4");
    expect(title()).toBe("Counter (1 clicks)");
    expect(displayColor()).toBe("black");
  });

  it("DOUBLE doubles the count", () => {
    click("INCREMENT");
    click("DOUBLE");
    expect(display()).toBe("2");
    expect(title()).toBe("Counter (2 clicks)");
    expect(displayColor()).toBe("black");
  });

  it("RESET still increments the click counter cc, like every matched action", () => {
    click("INCREMENT");
    expect(title()).toBe("Counter (1 clicks)");
    click("RESET");
    expect(display()).toBe("0");
    expect(title()).toBe("Counter (2 clicks)");
  });

  it("warns and leaves state untouched on an unrecognized action", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const displayBefore = display();
    const titleBefore = title();

    const unknownButton = document.createElement("button");
    unknownButton.dataset.action = "NOT_A_REAL_ACTION";
    document.getElementById("counter").appendChild(unknownButton);
    unknownButton.click();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "dispatch: unrecognized action",
      undefined,
    );
    expect(display()).toBe(displayBefore);
    expect(title()).toBe(titleBefore);

    warnSpy.mockRestore();
  });

  it("renders the count in red once it exceeds 10", () => {
    for (let i = 0; i < 11; i++) {
      click("INCREMENT");
    }
    expect(display()).toBe("11");
    expect(displayColor()).toBe("red");
  });

  it("renders the count in blue when it is negative", () => {
    click("DECREMENT");
    expect(display()).toBe("-1");
    expect(displayColor()).toBe("blue");
  });

  it("renders the count in black for zero and other non-negative, non-exceeding values", () => {
    click("ADD_FOUR");
    expect(display()).toBe("4");
    expect(displayColor()).toBe("black");
  });
});
