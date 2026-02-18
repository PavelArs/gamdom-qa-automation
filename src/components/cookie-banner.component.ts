import type { Page } from '@playwright/test';

export class CookieBannerComponent {
  constructor(private readonly page: Page) {}

  async dismissIfVisible(): Promise<void> {
    // Dismiss geo-restriction modal ("Got it!" button)
    // MUI backdrop intercepts pointer events; React synthetic events
    // may not fire from programmatic clicks, so we try multiple strategies
    try {
      const gotItBtn = this.page.getByText('Got it');
      // Strategy 1: JS click bypassing pointer interception
      await gotItBtn.evaluate((el: HTMLElement) => el.click());
      // Wait briefly for modal animation
      await this.page.waitForTimeout(1_000);
    } catch {
      // No geo-restriction modal
    }

    // If modal is still present, remove it from the DOM as fallback
    await this.page.evaluate(() => {
      document.querySelectorAll('.MuiModal-root').forEach((el) => el.remove());
      document.querySelectorAll('.MuiBackdrop-root').forEach((el) => el.remove());
    });

    try {
      const acceptBtn = this.page.locator('button:has-text("Accept"), [class*="cookie"] button').first();
      await acceptBtn.waitFor({ state: 'visible', timeout: 3_000 });
      await acceptBtn.click();
    } catch {
      // No cookie banner
    }
  }
}
