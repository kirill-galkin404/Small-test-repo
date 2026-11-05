import { defineConfig, devices } from '@playwright/test';
import { resolveTarget } from './e2e/targets';

const target = resolveTarget();

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: target.baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: target.command,
    url: target.baseURL + target.counterUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
