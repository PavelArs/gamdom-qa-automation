import type { Page, Locator } from '@playwright/test';

export class CookieBannerComponent {
  private readonly banner: Locator;
  private readonly acceptButton: Locator;

  constructor(private readonly page: Page) {
    this.banner = page.locator('[class*="cookie"], [class*="consent"], [id*="cookie"]').first();
    this.acceptButton = this.banner.getByRole('button', { name: /accept|agree|ok|got it/i });
  }

  async dismissIfVisible(): Promise<void> {
    try {
      await this.banner.waitFor({ state: 'visible', timeout: 3_000 });
      await this.acceptButton.click();
      await this.banner.waitFor({ state: 'hidden', timeout: 3_000 });
    } catch {
      // Banner not present — no action needed
    }
  }
}
