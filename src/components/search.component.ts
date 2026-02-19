import type { Locator } from '@playwright/test';

export class SearchComponent {
  readonly searchInput: Locator;
  readonly searchResults: Locator;

  constructor(readonly container: Locator) {
    this.searchInput = container.locator('input');
    this.searchResults = container.page().locator('[role="presentation"]');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.click();
    await Promise.all([
      this.container.page().waitForResponse(/games-search/),
      this.container.page().keyboard.type(query),
    ]);
  }
}
