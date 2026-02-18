import { test, expect } from '@fixtures/ui.fixture';

test.describe('Homepage — Critical Elements', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateAndDismissCookies();
  });

  test('should display core navigation and branding elements', async ({ homePage }) => {
    await expect(homePage.header.logo).toBeVisible();
    await expect(homePage.header.casinoLink).toBeVisible();
    await expect(homePage.header.sportsLink).toBeVisible();
    await expect(homePage.header.signInButton).toBeVisible();
    await expect(homePage.header.createAccountButton).toBeVisible();
  });

  test('should display game offerings and page structure', async ({ homePage }) => {
    await expect(homePage.footer).toBeVisible();

    const gamesCount = await homePage.originalGames.count();
    expect(gamesCount).toBeGreaterThan(0);
  });
});
