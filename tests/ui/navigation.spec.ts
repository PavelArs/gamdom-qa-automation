import { test, expect } from '@fixtures/ui.fixture';

test.describe('Main Sections', () => {
  test('should navigate to different sections', async ({ homePage }) => {
    await homePage.header.navigateToSports();
    await expect.soft(homePage.page).toHaveURL(/sports$/);

    await homePage.header.navigateToCasino();
    await expect.soft(homePage.page).toHaveURL(/casino$/);

    //TODO: Add more assertions for the navigation
  });
});
