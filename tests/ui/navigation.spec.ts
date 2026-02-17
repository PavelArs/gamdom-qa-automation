import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('Navigation — Main Sections', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateAndDismissCookies();
  });

  test('should navigate to Sports section and back to Casino', async ({ homePage, page }) => {
    await homePage.header.navigateToSports();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/sport/);

    await homePage.header.navigateToCasino();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/casino|\/$/);
  });
});
