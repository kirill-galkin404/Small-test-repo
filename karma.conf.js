// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.4/config/configuration-file.html
const fs = require('fs');

// karma-chrome-launcher auto-detects a system Chrome/Chromium via PATH or
// process.env.CHROME_BIN. In minimal/containerized environments without a
// system browser, fall back to a locally available Chromium if one exists.
if (!process.env.CHROME_BIN) {
  const fallbackCandidates = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'];
  const found = fallbackCandidates.find((candidate) => fs.existsSync(candidate));
  if (found) {
    process.env.CHROME_BIN = found;
  }
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/counter-app'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      // Needed because CI/sandbox containers commonly run as root, and
      // Chrome refuses to start sandboxed as root.
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    browsers: ['ChromeHeadlessCI'],
    singleRun: true,
    restartOnFileChange: true,
  });
};
