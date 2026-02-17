import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SportsPage } from '../pages/sports.page';

type UiFixtures = {
  homePage: HomePage;
  sportsPage: SportsPage;
};

export const test = base.extend<UiFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  sportsPage: async ({ page }, use) => {
    await use(new SportsPage(page));
  },
});

export { expect } from '@playwright/test';
