import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';

export class SportsPage extends BasePage {
  readonly url = '/sports';
  readonly header: HeaderComponent;

  readonly sportCategories: Locator;
  readonly eventsList: Locator;
  readonly liveSection: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);

    this.sportCategories = page.locator('[class*="sport-nav"], [class*="sport-menu"], [class*="category"]');
    this.eventsList = page.locator('[class*="event"], [class*="match"], [class*="fixture"]');
    this.liveSection = page.locator('[class*="live"], [data-live], :text("live")');
  }
}
