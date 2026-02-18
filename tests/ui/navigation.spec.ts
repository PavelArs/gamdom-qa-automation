import { test, expect } from '@fixtures/ui.fixture';

test.describe('Navigation — Main Sections', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateAndDismissCookies();
  });

  test('should navigate to Sports section and back to Casino', async ({ homePage, page }) => {
    await homePage.header.navigateToSports();
    await expect(page).toHaveURL(/sport/);

    await homePage.header.navigateToCasino();
    await expect(page).toHaveURL(/casino\/$/);
  });
});
