import type { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly url: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    // Wait for SPA hydration — the site uses client-side rendering
    await this.page.waitForLoadState('load');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForElement(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      locator.click(),
    ]);
  }
}
