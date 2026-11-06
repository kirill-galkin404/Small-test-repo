// React project only: the old /counter.html URL still reaches the working counter.
const { test, expect } = require("@playwright/test");

test("/counter.html redirects to the working counter", async ({ page }) => {
  await page.goto("/counter.html");
  await expect(page.locator("#d")).toBeVisible();
  await expect(page.locator("#ttl")).toHaveText("Counter");
  await page.locator('button[data-action="ADD_FOUR"]').click();
  await expect(page.locator("#d")).toHaveText("4");
  await expect(page.locator("#ttl")).toHaveText("Counter (1 clicks)");
  expect(new URL(page.url()).pathname).toBe("/");
});
