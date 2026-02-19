import { test as base } from '@playwright/test';
import { HomePage } from '@pages/home.page';
import { SportsPage } from '@pages/sports.page';

type UiFixtures = {
  homePage: HomePage;
  sportsPage: SportsPage;
};

export const test = base.extend<UiFixtures>({
  page: async ({ browser }, use) => {
    const browserContext = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: 'https://gamdom.com',
            localStorage: [
              {
                name: 'dismissed-blocked-popup',
                value: 'true',
              },
              {
                name: 'hasAcceptedCookies',
                value: 'true',
              },
              {
                name: 'onesignal-notification-prompt',
                value: JSON.stringify({value:'dismissed',timestamp:new Date().getTime()}),
              }
            ]
          }
        ]
      }
    });
    const page = await browserContext.newPage();
    await use(page);
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await use(homePage);
  },
  sportsPage: async ({ page }, use) => {
    const sportsPage = new SportsPage(page);
    await sportsPage.navigate();
    await use(sportsPage);
  },
});

export { expect } from '@playwright/test';
