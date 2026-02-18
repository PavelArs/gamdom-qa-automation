import { test, expect } from '@fixtures/ui.fixture';

test.describe('Game Search', () => {
  test('should find games when searching by name', async ({ homePage, page }) => {
    await homePage.navigateAndDismissCookies();

    await homePage.search.search('crash');

    // Look for any search results or game links matching the query
    const results = page.locator(
      '[class*="search-result"] a, [class*="game-card"], [class*="game-item"], a[href*="crash"]'
    );
    await expect(results.first()).toBeVisible({ timeout: 10_000 });
  });
});
