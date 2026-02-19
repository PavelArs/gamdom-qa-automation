import { test, expect } from '@fixtures/ui.fixture';

test.describe('Game Search', () => {
  test('should find games when searching by name', async ({ homePage }) => {
    await homePage.search.search('crash');

    await expect.soft(homePage.search.searchResults).toContainText('Crash');
  });
});
