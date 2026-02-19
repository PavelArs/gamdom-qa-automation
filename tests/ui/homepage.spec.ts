import { test, expect } from '@fixtures/ui.fixture';

test.describe('Critical Elements', () => {
  test('should display core navigation and branding elements', async ({ homePage }) => {
    await expect.soft(homePage.header.logo).toBeVisible();
    await expect.soft(homePage.header.casinoLink).toBeVisible();
    await expect.soft(homePage.header.sportsLink).toBeVisible();
    await expect.soft(homePage.header.originalsLink).toBeVisible();
    await expect.soft(homePage.header.supportLink).toBeVisible();
    await expect.soft(homePage.header.rewardsLink).toBeVisible();

    await expect.soft(homePage.header.signInButton).toBeVisible();
    await expect.soft(homePage.header.createAccountButton).toBeVisible();
  });
});
