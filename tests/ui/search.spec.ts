import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('Game Search', () => {
  test('should find games when searching by name', async ({ homePage, page }) => {
    await homePage.navigateAndDismissCookies();

    await homePage.search.search('crash');

    const results = page.locator(
      '[class*="search-result"] a, [class*="game-card"], [class*="game-item"], a[href*="crash"]'
    );
    await expect(results.first()).toBeVisible({ timeout: 5_000 });
  });
});
