// @ts-check
const { defineConfig } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

// Every spec opens the page with page.goto(""), i.e. the project's baseURL
// itself, so one suite runs unchanged against each project's entry page.
const legacyEntry = pathToFileURL(
  path.join(__dirname, "tests", "fixtures", "legacy-counter", "counter.html")
).href;

const PORT = 4173;

// The legacy project needs no server; skip the build when only it is selected,
// so `npm run test:legacy` does not depend on the React build.
const args = process.argv;
const legacyOnly = args.some(
  (a, i) => a === "--project=legacy" || (a === "--project" && args[i + 1] === "legacy")
);

module.exports = defineConfig({
  testDir: "./tests",
  projects: [
    {
      // Frozen copy of the original page, loaded via file:// with no server.
      name: "legacy",
      testMatch: "counter.spec.js",
      use: { baseURL: legacyEntry },
    },
    {
      // The React app, built and served by `vite preview` at /.
      name: "react",
      testMatch: ["counter.spec.js", "url-compat.spec.js"],
      use: { baseURL: `http://localhost:${PORT}/` },
    },
  ],
  webServer: legacyOnly
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: false,
        timeout: 120000,
      },
});
