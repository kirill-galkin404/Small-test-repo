// @ts-check
const { defineConfig } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

// Every spec opens the page with page.goto(""), i.e. the project's baseURL
// itself, so one suite runs unchanged against each project's entry page.
const legacyEntry = pathToFileURL(
  path.join(__dirname, "tests", "fixtures", "legacy-counter", "counter.html")
).href;

module.exports = defineConfig({
  testDir: "./tests",
  projects: [
    {
      // Frozen copy of the original page, loaded via file:// with no server.
      name: "legacy",
      testMatch: "counter.spec.js",
      use: { baseURL: legacyEntry },
    },
  ],
});
