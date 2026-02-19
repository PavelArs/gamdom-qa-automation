import type { Locator } from '@playwright/test';

export class HeaderComponent {
  readonly logo: Locator;
  readonly signInButton: Locator;
  readonly createAccountButton: Locator;

  readonly originalsLink: Locator;
  readonly casinoLink: Locator;
  readonly sportsLink: Locator;
  readonly supportLink: Locator;
  readonly rewardsLink: Locator;

  constructor(readonly container: Locator) {
    this.logo = container.locator('[href="/"]').first();
    this.signInButton = container.getByTestId('signin-nav');
    this.createAccountButton = container.getByTestId('signup-nav');

    this.originalsLink = container.getByTestId('navLink-home');
    this.casinoLink = container.getByTestId('navLink-casino-link');
    this.sportsLink = container.getByTestId('navLink-sports-link');
    this.supportLink = container.getByTestId('navLink-support');
    this.rewardsLink = container.getByTestId('navLink-rewards');
  }

  async navigateToSports(): Promise<void> {
    await this.sportsLink.click();
  }

  async navigateToCasino(): Promise<void> {
    await this.casinoLink.click();
  }
}
