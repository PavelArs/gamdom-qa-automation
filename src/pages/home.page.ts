import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';
import { CookieBannerComponent } from '@components/cookie-banner.component';
import { SearchComponent } from '@components/search.component';

export class HomePage extends BasePage {
  readonly url = '/';
  readonly header: HeaderComponent;
  readonly cookieBanner: CookieBannerComponent;
  readonly search: SearchComponent;

  readonly heroSection: Locator;
  readonly footer: Locator;
  readonly originalGames: Locator;
  readonly gameProviders: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cookieBanner = new CookieBannerComponent(page);
    this.search = new SearchComponent(page);

    this.heroSection = page.locator('[class*="hero"], [class*="banner"], [class*="slider"]').first();
    this.footer = page.locator('footer').first();
    this.originalGames = page.locator('a[href*="crash"], a[href*="dice"], a[href*="roulette"], a[href*="plinko"], a[href*="mines"]');
    this.gameProviders = page.locator('[class*="provider"], [class*="supplier"]');
  }

  async navigateAndDismissCookies(): Promise<void> {
    await this.navigate();
    await this.cookieBanner.dismissIfVisible();
  }
}
