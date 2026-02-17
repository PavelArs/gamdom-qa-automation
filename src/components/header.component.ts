import type { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly container: Locator;
  readonly logo: Locator;
  readonly casinoLink: Locator;
  readonly sportsLink: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.container = page.locator('header, nav, [class*="header"], [class*="navbar"]').first();
    this.logo = this.container.locator('a[href="/"], img[alt*="gamdom" i], [class*="logo"]').first();
    this.casinoLink = page.getByRole('link', { name: /casino/i }).first();
    this.sportsLink = page.getByRole('link', { name: /sports/i }).first();
    this.loginButton = page.getByRole('button', { name: /log\s?in|sign\s?in/i }).first();
  }

  async navigateToCasino(): Promise<void> {
    await this.casinoLink.click();
  }

  async navigateToSports(): Promise<void> {
    await this.sportsLink.click();
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }
}
