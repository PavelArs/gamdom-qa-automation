import type { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly logo: Locator;
  readonly signInButton: Locator;
  readonly createAccountButton: Locator;
  readonly casinoLink: Locator;
  readonly sportsLink: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.locator('a[href="/"]').first();
    this.signInButton = page.getByText('Sign in').first();
    this.createAccountButton = page.getByText('Create Account').first();

    this.casinoLink = page.locator('a[href*="casino"], a:has-text("Casino")').first();
    this.sportsLink = page.locator('a[href*="sport"], a:has-text("Sports")').first();
  }

  async navigateToCasino(): Promise<void> {
    await this.casinoLink.click();
    await this.page.waitForLoadState('load');
  }

  async navigateToSports(): Promise<void> {
    await this.sportsLink.click();
    await this.page.waitForLoadState('load');
  }

  async clickSignIn(): Promise<void> {
    await this.signInButton.click();
  }
}
