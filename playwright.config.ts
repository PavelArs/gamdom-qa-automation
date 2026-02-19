import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
config();

export default defineConfig({
  timeout: 15_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // rate limiting on prod
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.BASE_URL || 'https://gamdom.com',
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        screenshot: 'only-on-failure',
        trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
      },
    },
    // TODO: Add tablet and mobile tests
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.JIRA_BASE_URL || 'https://autoapi.atlassian.net',
        extraHTTPHeaders: {
          Authorization: `Basic ${process.env.JIRA_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    },
  ],
});
