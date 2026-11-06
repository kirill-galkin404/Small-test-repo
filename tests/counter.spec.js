// Characterization suite for the counter page. It runs unchanged against the
// frozen legacy page and the React build; each project's baseURL is its entry
// page, so page.goto("") opens it.
const { test, expect } = require("@playwright/test");

const BLACK = "rgb(0, 0, 0)";
const RED = "rgb(255, 0, 0)";
const BLUE = "rgb(0, 0, 255)";

const BUTTON = {
  INCREMENT: "+",
  DECREMENT: "-",
  RESET: "reset",
  ADD_FOUR: "+4",
  DOUBLE: "x2",
};

async function click(page, action, times = 1) {
  for (let i = 0; i < times; i++) {
    await page.locator(`button[data-action="${action}"]`).click();
  }
}

const value = (page) => page.locator("#d");
const title = (page) => page.locator("#ttl");

test.beforeEach(async ({ page }) => {
  await page.goto("");
});

test("initial state: value 0, black, title 'Counter'", async ({ page }) => {
  await expect(value(page)).toHaveText("0");
  await expect(value(page)).toHaveCSS("color", BLACK);
  await expect(title(page)).toHaveText("Counter");
});

test("five buttons with the expected labels and data-action attributes", async ({ page }) => {
  const buttons = page.locator("#counter button");
  await expect(buttons).toHaveCount(5);
  for (const [action, label] of Object.entries(BUTTON)) {
    await expect(page.locator(`button[data-action="${action}"]`)).toHaveText(label);
  }
});

test("+1 increments", async ({ page }) => {
  await click(page, "INCREMENT");
  await expect(value(page)).toHaveText("1");
  await click(page, "INCREMENT");
  await expect(value(page)).toHaveText("2");
});

test("-1 decrements and can go negative", async ({ page }) => {
  await click(page, "DECREMENT");
  await expect(value(page)).toHaveText("-1");
  await click(page, "DECREMENT", 2);
  await expect(value(page)).toHaveText("-3");
});

test("reset sets the value to 0", async ({ page }) => {
  await click(page, "ADD_FOUR");
  await expect(value(page)).toHaveText("4");
  await click(page, "RESET");
  await expect(value(page)).toHaveText("0");
  await click(page, "DECREMENT");
  await click(page, "RESET");
  await expect(value(page)).toHaveText("0");
  await expect(value(page)).toHaveCSS("color", BLACK);
});

test("+4 adds four", async ({ page }) => {
  await click(page, "ADD_FOUR");
  await expect(value(page)).toHaveText("4");
  await click(page, "ADD_FOUR");
  await expect(value(page)).toHaveText("8");
});

test("x2 doubles the value", async ({ page }) => {
  await click(page, "ADD_FOUR");
  await click(page, "DOUBLE");
  await expect(value(page)).toHaveText("8");
  await click(page, "DOUBLE");
  await expect(value(page)).toHaveText("16");
});

test("x2 of 0 stays 0 but still counts as a click", async ({ page }) => {
  await click(page, "DOUBLE");
  await expect(value(page)).toHaveText("0");
  await expect(value(page)).toHaveCSS("color", BLACK);
  await expect(title(page)).toHaveText("Counter (1 clicks)");
});

test("x2 of a negative value doubles it and stays blue", async ({ page }) => {
  await click(page, "DECREMENT");
  await click(page, "DOUBLE");
  await expect(value(page)).toHaveText("-2");
  await expect(value(page)).toHaveCSS("color", BLUE);
  await click(page, "DOUBLE");
  await expect(value(page)).toHaveText("-4");
});

test("color boundaries: 10 black, 11 red, 0 black, -1 blue", async ({ page }) => {
  await click(page, "ADD_FOUR", 2);
  await click(page, "INCREMENT", 2);
  await expect(value(page)).toHaveText("10");
  await expect(value(page)).toHaveCSS("color", BLACK);

  await click(page, "INCREMENT");
  await expect(value(page)).toHaveText("11");
  await expect(value(page)).toHaveCSS("color", RED);

  await click(page, "RESET");
  await expect(value(page)).toHaveText("0");
  await expect(value(page)).toHaveCSS("color", BLACK);

  await click(page, "DECREMENT");
  await expect(value(page)).toHaveText("-1");
  await expect(value(page)).toHaveCSS("color", BLUE);

  await click(page, "INCREMENT");
  await expect(value(page)).toHaveText("0");
  await expect(value(page)).toHaveCSS("color", BLACK);
});

test("color returns from red to black when decremented to 10", async ({ page }) => {
  await click(page, "ADD_FOUR", 3);
  await expect(value(page)).toHaveText("12");
  await expect(value(page)).toHaveCSS("color", RED);
  await click(page, "DECREMENT", 2);
  await expect(value(page)).toHaveText("10");
  await expect(value(page)).toHaveCSS("color", BLACK);
});

test("title tallies every click, including reset, with 'N clicks' wording", async ({ page }) => {
  await expect(title(page)).toHaveText("Counter");
  await click(page, "INCREMENT");
  await expect(title(page)).toHaveText("Counter (1 clicks)");
  await click(page, "DECREMENT");
  await expect(title(page)).toHaveText("Counter (2 clicks)");
  await click(page, "RESET");
  await expect(title(page)).toHaveText("Counter (3 clicks)");
  await click(page, "ADD_FOUR");
  await expect(title(page)).toHaveText("Counter (4 clicks)");
  await click(page, "DOUBLE");
  await expect(title(page)).toHaveText("Counter (5 clicks)");
});

test("clicking outside the buttons changes nothing", async ({ page }) => {
  await click(page, "INCREMENT");
  await page.locator("#d").click();
  await page.locator("#ttl").click();
  await expect(value(page)).toHaveText("1");
  await expect(title(page)).toHaveText("Counter (1 clicks)");
});
