import { HeaderComponent } from '@components/header.component';
import type { Page, Locator } from '@playwright/test';
import { FooterComponent } from '@components/footer.component';

export abstract class BasePage {
  abstract readonly url: string;

  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly pageContent: Locator;

  constructor(readonly page: Page) {
    this.header = new HeaderComponent(page.getByTestId('headerContainer'));
    this.footer = new FooterComponent(page.getByTestId('footerContainer'));
    this.pageContent = page.getByTestId('page-content');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.pageContent.waitFor({ state: 'visible' });
  }
}
