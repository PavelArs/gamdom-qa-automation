import type { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { SearchComponent } from '@components/search.component';

export class HomePage extends BasePage {
  readonly url = '/';
  readonly search: SearchComponent;

  constructor(page: Page) {
    super(page);
    this.search = new SearchComponent(page.getByTestId('searchInputFieldContainer'));
  }
}
