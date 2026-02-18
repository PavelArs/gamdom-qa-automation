import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
config();

export default defineConfig({
  timeout: 15_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : '50%',
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
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
      },
    },
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
