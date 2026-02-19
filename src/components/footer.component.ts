import type { Locator } from '@playwright/test';

export class FooterComponent {
  constructor(readonly container: Locator) {}
}
