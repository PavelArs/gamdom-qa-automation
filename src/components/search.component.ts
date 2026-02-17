import type { Page, Locator } from '@playwright/test';

export class SearchComponent {
  private readonly searchTrigger: Locator;
  private readonly searchInput: Locator;
  private readonly searchResults: Locator;

  constructor(private readonly page: Page) {
    this.searchTrigger = page.locator(
      'button:has(svg), [data-testid*="search"], [class*="search-icon"], [class*="search-trigger"]'
    ).first();
    this.searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();
    this.searchResults = page.locator(
      '[class*="search-result"], [class*="game-card"], [class*="game-item"]'
    );
  }

  async openSearch(): Promise<void> {
    if (!(await this.searchInput.isVisible())) {
      await this.searchTrigger.click();
    }
    await this.searchInput.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async search(query: string): Promise<void> {
    await this.openSearch();
    await this.searchInput.fill(query);
    // Allow debounce and API response
    await this.page.waitForTimeout(1_000);
  }

  async getResultCount(): Promise<number> {
    return this.searchResults.count();
  }

  async isInputVisible(): Promise<boolean> {
    return this.searchInput.isVisible();
  }
}
