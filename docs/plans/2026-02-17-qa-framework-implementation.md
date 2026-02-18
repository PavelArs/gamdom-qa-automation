# QA Automation Framework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Playwright + TypeScript QA automation framework for Gamdom iGaming platform with UI E2E tests and JIRA REST API tests.

**Architecture:** Page Object Model with component composition, custom Playwright fixtures for DI, typed API client layer with builder pattern for test data. Two Playwright projects: `ui` (browser-based) and `api` (request-only).

**Tech Stack:** Playwright, TypeScript, bun (native .env loading — no dotenv needed)

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `.env`
- Create: `.gitignore`

**Step 1: Initialize bun project and install dependencies**

```bash
cd /Users/pavelars-work/Work/personal_repos/gamdom
bun init -y
bun add -d @playwright/test
bunx playwright install chromium
```

> **Note:** Bun natively loads `.env` files automatically — no `dotenv` package needed. It reads `.env`, `.env.local`, `.env.development`, `.env.production` in order of increasing precedence.

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@components/*": ["src/components/*"],
      "@api/*": ["src/api/*"],
      "@fixtures/*": ["src/fixtures/*"],
      "@models/*": ["src/models/*"],
      "@helpers/*": ["src/helpers/*"]
    }
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "playwright.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

// Bun automatically loads .env files — no manual dotenv setup required

export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.BASE_URL || 'https://gamdom.com',
        ...devices['Desktop Chrome'],
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.JIRA_BASE_URL || 'https://autoapi.atlassian.net',
        extraHTTPHeaders: {
          Authorization: `Basic ${process.env.JIRA_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    },
  ],
});
```

**Step 4: Create .env.example and .env**

`.env.example`:
```
BASE_URL=https://gamdom.com
JIRA_BASE_URL=https://autoapi.atlassian.net
JIRA_AUTH_TOKEN=<your-base64-encoded-token>
JIRA_PROJECT_KEY=DEV
```

`.env` (actual values):
```
BASE_URL=https://gamdom.com
JIRA_BASE_URL=https://autoapi.atlassian.net
JIRA_AUTH_TOKEN=c3ZldG9zbGF2LmxhemFyb3Y5MkBnbWFpbC5jb206QVRBVFQzeEZmR0YwMFhnOHpaTF9OckpXUEQ1Z2pGM3VVazBWbUNlYVFvMmw1a3I0TDFrNzI0VXZHQ1JsRm5xMjhpdk5oUXFaeGVibTVmMkxaTHRMQ1RGNVhBT3VtSm9lUDJyT0N4SlZ5ZkR2b1dXMVRnN1JJajZSZGZmZEZiM2pPUEc2eDZ4YXFxMGJybWNwSzZPRG85Q1pZQVNLYjRkbHVUcjdGSEV0cUlCaDBqNUJTYXVleU5JPUYyMDdGNjdD
JIRA_PROJECT_KEY=DEV
```

**Step 5: Create .gitignore**

```
node_modules/
dist/
.env
test-results/
playwright-report/
blob-report/
```

**Step 6: Create directory structure**

```bash
mkdir -p src/{pages,components,api,fixtures,models,helpers}
mkdir -p tests/{ui,api}
mkdir -p docs
```

**Step 7: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: scaffold project with playwright, typescript, bun"
```

---

### Task 2: TypeScript Models & Test Data Builder

**Files:**
- Create: `src/models/jira.types.ts`
- Create: `src/helpers/test-data.builder.ts`

**Step 1: Create JIRA API type definitions**

`src/models/jira.types.ts`:
```typescript
export interface AdfDocument {
  version: 1;
  type: 'doc';
  content: AdfNode[];
}

export interface AdfNode {
  type: string;
  content?: AdfNode[];
  text?: string;
}

export interface CreateIssuePayload {
  fields: {
    project: { key: string };
    summary: string;
    description?: AdfDocument;
    issuetype: { name: string };
    priority?: { name: string };
    labels?: string[];
  };
}

export interface UpdateIssuePayload {
  fields: Partial<CreateIssuePayload['fields']>;
}

export interface IssueResponse {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description: AdfDocument | null;
    status: { name: string };
    issuetype: { name: string };
    priority: { name: string };
    labels: string[];
    project: { key: string };
    created: string;
    updated: string;
  };
}

export interface SearchResponse {
  startAt: number;
  maxResults: number;
  total: number;
  issues: IssueResponse[];
}
```

**Step 2: Create test data builder**

`src/helpers/test-data.builder.ts`:
```typescript
import type { CreateIssuePayload, AdfDocument } from '../models/jira.types';

export class IssueBuilder {
  private payload: CreateIssuePayload;

  constructor() {
    this.payload = {
      fields: {
        project: { key: process.env.JIRA_PROJECT_KEY || 'DEV' },
        summary: `[Auto] Test Issue ${Date.now()}`,
        issuetype: { name: 'Task' },
      },
    };
  }

  withSummary(summary: string): this {
    this.payload.fields.summary = summary;
    return this;
  }

  withDescription(text: string): this {
    this.payload.fields.description = IssueBuilder.createAdf(text);
    return this;
  }

  withPriority(priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'): this {
    this.payload.fields.priority = { name: priority };
    return this;
  }

  withLabels(...labels: string[]): this {
    this.payload.fields.labels = labels;
    return this;
  }

  withType(type: 'Task' | 'Bug' | 'Story'): this {
    this.payload.fields.issuetype = { name: type };
    return this;
  }

  build(): CreateIssuePayload {
    return structuredClone(this.payload);
  }

  static createAdf(text: string): AdfDocument {
    return {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text }],
        },
      ],
    };
  }
}
```

**Step 3: Commit**

```bash
git add src/models/ src/helpers/
git commit -m "feat: add JIRA type definitions and test data builder"
```

---

### Task 3: Base Infrastructure (BasePage + BaseApiClient)

**Files:**
- Create: `src/pages/base.page.ts`
- Create: `src/api/base-api.client.ts`

**Step 1: Create abstract base page**

`src/pages/base.page.ts`:
```typescript
import type { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly url: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForElement(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      locator.click(),
    ]);
  }
}
```

**Step 2: Create base API client**

`src/api/base-api.client.ts`:
```typescript
import type { APIRequestContext, APIResponse } from '@playwright/test';

export abstract class BaseApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<{ status: number; body: T }> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;

    const response = await this.request.get(url);
    return this.parseResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data: unknown): Promise<{ status: number; body: T }> {
    const response = await this.request.post(endpoint, { data });
    return this.parseResponse<T>(response);
  }

  protected async put(endpoint: string, data: unknown): Promise<{ status: number }> {
    const response = await this.request.put(endpoint, { data });
    return { status: response.status() };
  }

  protected async delete(endpoint: string): Promise<{ status: number }> {
    const response = await this.request.delete(endpoint);
    return { status: response.status() };
  }

  private async parseResponse<T>(response: APIResponse): Promise<{ status: number; body: T }> {
    const status = response.status();
    if (status === 204) {
      return { status, body: {} as T };
    }
    try {
      const body = (await response.json()) as T;
      return { status, body };
    } catch {
      return { status, body: {} as T };
    }
  }
}
```

**Step 3: Commit**

```bash
git add src/pages/base.page.ts src/api/base-api.client.ts
git commit -m "feat: add base page object and base API client"
```

---

### Task 4: UI Components

**Files:**
- Create: `src/components/header.component.ts`
- Create: `src/components/cookie-banner.component.ts`
- Create: `src/components/search.component.ts`

**Step 1: Create header component**

`src/components/header.component.ts`:
```typescript
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
```

**Step 2: Create cookie banner component**

`src/components/cookie-banner.component.ts`:
```typescript
import type { Page, Locator } from '@playwright/test';

export class CookieBannerComponent {
  private readonly banner: Locator;
  private readonly acceptButton: Locator;

  constructor(private readonly page: Page) {
    this.banner = page.locator('[class*="cookie"], [class*="consent"], [id*="cookie"]').first();
    this.acceptButton = this.banner.getByRole('button', { name: /accept|agree|ok|got it/i });
  }

  async dismissIfVisible(): Promise<void> {
    try {
      await this.banner.waitFor({ state: 'visible', timeout: 3_000 });
      await this.acceptButton.click();
      await this.banner.waitFor({ state: 'hidden', timeout: 3_000 });
    } catch {
      // Banner not present — no action needed
    }
  }
}
```

**Step 3: Create search component**

`src/components/search.component.ts`:
```typescript
import type { Page, Locator } from '@playwright/test';

export class SearchComponent {
  private readonly searchTrigger: Locator;
  private readonly searchInput: Locator;
  private readonly searchResults: Locator;

  constructor(private readonly page: Page) {
    this.searchTrigger = page.locator(
      'button:has(svg), [data-testid*="search"], [class*="search-icon"], [class*="search-trigger"]'
    ).first();
    this.searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();
    this.searchResults = page.locator(
      '[class*="search-result"], [class*="game-card"], [class*="game-item"]'
    );
  }

  async openSearch(): Promise<void> {
    if (!(await this.searchInput.isVisible())) {
      await this.searchTrigger.click();
    }
    await this.searchInput.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async search(query: string): Promise<void> {
    await this.openSearch();
    await this.searchInput.fill(query);
    // Allow debounce and API response
    await this.page.waitForTimeout(1_000);
  }

  async getResultCount(): Promise<number> {
    return this.searchResults.count();
  }

  async isInputVisible(): Promise<boolean> {
    return this.searchInput.isVisible();
  }
}
```

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add header, cookie banner, and search components"
```

---

### Task 5: Page Objects

**Files:**
- Create: `src/pages/home.page.ts`
- Create: `src/pages/sports.page.ts`

**Step 1: Create home page object**

`src/pages/home.page.ts`:
```typescript
import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';
import { CookieBannerComponent } from '../components/cookie-banner.component';
import { SearchComponent } from '../components/search.component';

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
```

**Step 2: Create sports page object**

`src/pages/sports.page.ts`:
```typescript
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
```

**Step 3: Commit**

```bash
git add src/pages/
git commit -m "feat: add home and sports page objects"
```

---

### Task 6: Custom Fixtures

**Files:**
- Create: `src/fixtures/ui.fixture.ts`
- Create: `src/fixtures/api.fixture.ts`

**Step 1: Create UI fixtures**

`src/fixtures/ui.fixture.ts`:
```typescript
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
```

**Step 2: Create API fixtures**

`src/fixtures/api.fixture.ts`:
```typescript
import { test as base } from '@playwright/test';
import { JiraIssuesClient } from '../api/jira-issues.client';

type ApiFixtures = {
  jiraIssues: JiraIssuesClient;
};

export const test = base.extend<ApiFixtures>({
  jiraIssues: async ({ request }, use) => {
    await use(new JiraIssuesClient(request));
  },
});

export { expect } from '@playwright/test';
```

**Step 3: Commit**

```bash
git add src/fixtures/
git commit -m "feat: add custom Playwright fixtures for UI and API"
```

---

### Task 7: JIRA API Client

**Files:**
- Create: `src/api/jira-issues.client.ts`

**Step 1: Create typed JIRA issues client**

`src/api/jira-issues.client.ts`:
```typescript
import { BaseApiClient } from './base-api.client';
import type {
  CreateIssuePayload,
  UpdateIssuePayload,
  IssueResponse,
  SearchResponse,
} from '../models/jira.types';

export class JiraIssuesClient extends BaseApiClient {
  private readonly basePath = '/rest/api/3/issue';

  async createIssue(payload: CreateIssuePayload): Promise<{ status: number; body: IssueResponse }> {
    return this.post<IssueResponse>(this.basePath, payload);
  }

  async getIssue(issueKey: string): Promise<{ status: number; body: IssueResponse }> {
    return this.get<IssueResponse>(`${this.basePath}/${issueKey}`);
  }

  async updateIssue(issueKey: string, payload: UpdateIssuePayload): Promise<{ status: number }> {
    return this.put(`${this.basePath}/${issueKey}`, payload);
  }

  async deleteIssue(issueKey: string): Promise<{ status: number }> {
    return this.delete(`${this.basePath}/${issueKey}`);
  }

  async searchIssues(jql: string, maxResults = 10): Promise<{ status: number; body: SearchResponse }> {
    return this.get<SearchResponse>('/rest/api/3/search', {
      jql,
      maxResults: maxResults.toString(),
    });
  }
}
```

**Step 2: Commit**

```bash
git add src/api/jira-issues.client.ts
git commit -m "feat: add typed JIRA issues API client"
```

---

### Task 8: UI Tests (3 specs)

**Files:**
- Create: `tests/ui/homepage.spec.ts`
- Create: `tests/ui/navigation.spec.ts`
- Create: `tests/ui/search.spec.ts`

**Step 1: Create homepage test**

`tests/ui/homepage.spec.ts`:
```typescript
import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('Homepage — Critical Elements', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateAndDismissCookies();
  });

  test('should display core navigation and branding elements', async ({ homePage }) => {
    await expect(homePage.header.logo).toBeVisible();
    await expect(homePage.header.casinoLink).toBeVisible();
    await expect(homePage.header.sportsLink).toBeVisible();
    await expect(homePage.header.loginButton).toBeVisible();
  });

  test('should display game offerings and page structure', async ({ homePage }) => {
    await expect(homePage.footer).toBeVisible();

    const gamesCount = await homePage.originalGames.count();
    expect(gamesCount).toBeGreaterThan(0);
  });
});
```

**Step 2: Create navigation test**

`tests/ui/navigation.spec.ts`:
```typescript
import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('Navigation — Main Sections', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateAndDismissCookies();
  });

  test('should navigate to Sports section and back to Casino', async ({ homePage, page }) => {
    await homePage.header.navigateToSports();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/sport/);

    await homePage.header.navigateToCasino();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/casino|\/$/);
  });
});
```

**Step 3: Create search test**

`tests/ui/search.spec.ts`:
```typescript
import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('Game Search', () => {
  test('should find games when searching by name', async ({ homePage, page }) => {
    await homePage.navigateAndDismissCookies();

    await homePage.search.search('crash');

    const results = page.locator(
      '[class*="search-result"] a, [class*="game-card"], [class*="game-item"], a[href*="crash"]'
    );
    await expect(results.first()).toBeVisible({ timeout: 5_000 });
  });
});
```

**Step 4: Commit**

```bash
git add tests/ui/
git commit -m "feat: add UI tests for homepage, navigation, and search"
```

---

### Task 9: API Tests (JIRA CRUD Workflow)

**Files:**
- Create: `tests/api/jira-issues.spec.ts`

**Step 1: Create JIRA CRUD workflow test**

`tests/api/jira-issues.spec.ts`:
```typescript
import { test, expect } from '../../src/fixtures/api.fixture';
import { IssueBuilder } from '../../src/helpers/test-data.builder';

test.describe.serial('JIRA Issues — CRUD Workflow', () => {
  const projectKey = process.env.JIRA_PROJECT_KEY || 'DEV';
  let createdIssueKey: string;

  test('POST /issue — should create a new issue', async ({ jiraIssues }) => {
    const payload = new IssueBuilder()
      .withSummary(`[Auto] E2E Test Issue ${Date.now()}`)
      .withDescription('Created by automated test — CRUD workflow validation')
      .withPriority('Medium')
      .withLabels('automated-test', 'e2e')
      .build();

    const { status, body } = await jiraIssues.createIssue(payload);

    expect(status).toBe(201);
    expect(body.key).toMatch(new RegExp(`^${projectKey}-\\d+$`));

    createdIssueKey = body.key;
  });

  test('GET /issue/{key} — should retrieve the created issue', async ({ jiraIssues }) => {
    const { status, body } = await jiraIssues.getIssue(createdIssueKey);

    expect(status).toBe(200);
    expect(body.key).toBe(createdIssueKey);
    expect(body.fields.summary).toContain('[Auto] E2E Test Issue');
    expect(body.fields.labels).toContain('automated-test');
    expect(body.fields.priority.name).toBe('Medium');
  });

  test('PUT /issue/{key} — should update issue fields', async ({ jiraIssues }) => {
    const updatedSummary = `[Auto] Updated Issue ${Date.now()}`;

    const { status } = await jiraIssues.updateIssue(createdIssueKey, {
      fields: {
        summary: updatedSummary,
        priority: { name: 'High' },
        labels: ['automated-test', 'e2e', 'updated'],
      },
    });

    expect(status).toBe(204);

    // Verify update persisted
    const { body } = await jiraIssues.getIssue(createdIssueKey);
    expect(body.fields.summary).toBe(updatedSummary);
    expect(body.fields.priority.name).toBe('High');
    expect(body.fields.labels).toContain('updated');
  });

  test('GET /search — should find issue via JQL query', async ({ jiraIssues }) => {
    const { status, body } = await jiraIssues.searchIssues(
      `project = ${projectKey} AND key = ${createdIssueKey}`
    );

    expect(status).toBe(200);
    expect(body.total).toBeGreaterThanOrEqual(1);

    const found = body.issues.find((i) => i.key === createdIssueKey);
    expect(found).toBeDefined();
    expect(found!.fields.priority.name).toBe('High');
  });

  test('DELETE /issue/{key} — should delete issue and confirm removal', async ({ jiraIssues }) => {
    const { status } = await jiraIssues.deleteIssue(createdIssueKey);
    expect(status).toBe(204);

    // Verify deletion returns 404
    const { status: getStatus } = await jiraIssues.getIssue(createdIssueKey);
    expect(getStatus).toBe(404);
  });
});
```

**Step 2: Run API tests to verify**

```bash
bunx playwright test --project=api
```

Expected: All 5 tests pass (Create, Read, Update, Search, Delete).

**Step 3: Commit**

```bash
git add tests/api/
git commit -m "feat: add JIRA Issues CRUD workflow API tests"
```

---

### Task 10: Documentation

**Files:**
- Create: `docs/exploratory-testing.md`
- Create: `docs/complex-scenario.md`
- Create: `README.md`

**Step 1: Create exploratory testing document**

`docs/exploratory-testing.md`:
```markdown
# Exploratory Testing — Gamdom (gamdom.com)

## Overview

Exploratory testing was performed on the Gamdom iGaming platform to identify the most business-critical areas. Below are 5 key areas ranked by business impact, along with representative test scenarios and risk assessment for each.

---

## 1. User Authentication & Registration

**Business Criticality:** Very High — gateway to all platform functionality. A broken auth flow means zero revenue.

**Key Scenarios:**
- Registration via email with valid/invalid data
- Login via social providers (Google, Steam, Telegram)
- Password recovery flow
- Session persistence across page refreshes and tabs
- Logout and session invalidation
- Rate limiting on failed login attempts

**Risks:**
- Account takeover via broken session management
- Users unable to register → direct revenue loss
- Social login provider outages creating access issues

---

## 2. Deposit & Withdrawal Operations

**Business Criticality:** Very High — directly tied to revenue. Any issue here causes immediate financial impact and loss of trust.

**Key Scenarios:**
- Crypto deposit (BTC, ETH, USDT) — address generation, confirmation tracking
- Fiat deposit via supported methods
- Minimum deposit validation ($5 threshold)
- Withdrawal request creation and processing
- Withdrawal to correct wallet address
- Transaction history accuracy
- Currency conversion display

**Risks:**
- Funds lost due to incorrect wallet address handling
- Deposit not credited → support burden + churn
- Withdrawal delays eroding user trust

---

## 3. Game Lobby & Navigation

**Business Criticality:** High — core UX that drives engagement and game discovery. Poor navigation reduces time-on-site and bets placed.

**Key Scenarios:**
- Homepage loads with all game categories visible
- Navigation between Casino, Sports, and sub-sections
- Game search by name (e.g., "Crash", "Dice")
- Category filtering (Original Games, Slots, Live Casino)
- Provider filtering
- Game card display (thumbnail, name, provider)
- Deep linking to specific games
- Responsive layout across viewport sizes

**Risks:**
- Games not appearing in search → reduced engagement
- Broken navigation → users can't find content
- Slow load times → high bounce rate

---

## 4. Sports Betting

**Business Criticality:** High — major business vertical alongside casino. Live betting is a key differentiator.

**Key Scenarios:**
- Sport category browsing (Football, Basketball, Tennis, etc.)
- Event listing with correct odds display
- Live events section with real-time updates
- Bet slip addition and removal
- Single and accumulator bet placement
- Odds format switching (decimal, fractional, American)
- Cash-out functionality during live events

**Risks:**
- Incorrect odds displayed → financial liability
- Bet placement failures during high traffic (live events)
- Real-time data lag causing stale odds

---

## 5. Responsible Gambling Controls

**Business Criticality:** High — regulatory compliance. Failure here risks the gaming license, which would shut down the entire operation.

**Key Scenarios:**
- Deposit limit setting (daily, weekly, monthly)
- Deposit limit enforcement (cannot exceed set limit)
- Self-exclusion activation
- Self-exclusion enforcement (cannot access games during exclusion period)
- Age verification (Veriff Level 2) flow
- Cool-off period functionality
- Reality check / session time notifications

**Risks:**
- Non-compliance with licensing requirements → license revocation
- Users able to bypass deposit limits → regulatory fines
- Missing age verification → legal liability
```

**Step 2: Create complex scenario document**

`docs/complex-scenario.md`:
```markdown
# Complex Scenario — Live Sports Betting with Real-Time Odds Changes

## Scenario Description

A user navigates to the Sports section, selects a live football match, adds a selection to the bet slip with displayed odds of 2.10, but by the time they confirm the bet, the odds have shifted to 1.95 due to an in-game event (e.g., a goal). The system must handle this race condition: reject the bet, notify the user of the odds change, and allow them to accept the new odds or cancel.

## Why It's Challenging to Automate

### 1. Real-Time Data via WebSockets
Odds updates arrive through WebSocket connections, not traditional HTTP requests. Playwright's `page.route()` intercepts HTTP but not WebSocket frames by default. The test needs to either:
- Intercept and control the WebSocket feed to simulate odds changes at precise moments
- Or work with the live data stream and handle inherent timing variability

### 2. Race Condition Between UI State and Server State
The core scenario is a race condition: the user sees odds X, clicks "Place Bet", but the server has already moved to odds Y. Reproducing this deterministically in a test requires precise timing control over:
- When the odds update reaches the client
- When the user action (bet placement) is triggered
- The server's validation window

### 3. Non-Deterministic Timing
Live events produce odds changes at unpredictable intervals. A test relying on real live data would be flaky by nature — the odds might or might not change during the test execution window.

### 4. Complex UI State Machine
The bet slip has multiple states: empty → selection added → odds changed (needs confirmation) → bet placed / bet rejected. Testing all transitions requires careful orchestration, especially the "odds changed" intermediate state that may only appear for seconds.

### 5. Authentication & Balance Requirements
Placing a bet requires an authenticated user with sufficient balance, adding setup complexity and potential side effects (actual balance changes).

## Proposed Solution Approach

### Strategy: WebSocket Interception + Controlled Mock Feed

1. **Intercept WebSocket connection** using Playwright's `page.evaluate()` to monkey-patch the native WebSocket constructor before the page loads. Wrap the real WebSocket to inject controlled messages.

2. **Phase 1 — Setup:** Navigate to live sports, select an event. Capture the current odds from the UI. Add selection to bet slip.

3. **Phase 2 — Trigger odds change:** Through the intercepted WebSocket, inject a crafted odds update message with new odds while the bet slip is open. This simulates a real-time odds shift.

4. **Phase 3 — Assert UI response:** Verify the bet slip reflects the odds change — either:
   - A notification/banner indicating "Odds have changed"
   - Updated odds in the bet slip with an "Accept new odds" button
   - The "Place Bet" button being disabled until user acknowledges

5. **Phase 4 — Complete flow:** Click "Accept new odds" and place the bet. Verify the bet confirmation shows the new odds value.

### Alternative Approach: API-Level Testing
Instead of full E2E through the UI, test the bet placement API directly:
- Call the bet placement endpoint with `requestedOdds: 2.10`
- Ensure the server has already moved odds to `1.95`
- Assert the API returns an appropriate error code (e.g., `ODDS_CHANGED`)
- Send a follow-up request with `acceptOddsChange: true`

This is more reliable but doesn't test the UI state machine.

## What Would Need Further Investigation

1. **WebSocket message format** — Inspect the actual WebSocket frames in DevTools to understand the message structure for odds updates. Need the exact JSON schema to craft realistic mock messages.

2. **Odds update frequency** — Monitor how frequently odds change during a live match to understand timing constraints for the test.

3. **Bet placement API contract** — Understand the exact request/response format, especially how odds validation works (is there an `acceptOddsChange` flag? A tolerance threshold? An `oddsVersion` identifier?).

4. **WebSocket reconnection behavior** — If the WebSocket drops during the test, does the client reconnect? Does it fetch a fresh snapshot? This affects test stability.

5. **Bet slip state persistence** — Does the bet slip survive page refresh? Is state stored in localStorage or only in memory? This determines available recovery patterns.

6. **Rate limiting and anti-fraud** — Automated bet placement might trigger fraud detection. Need to understand thresholds and how to work within them during testing.
```

**Step 3: Create README.md**

`README.md`:
```markdown
# Gamdom QA Automation Framework

End-to-end test automation framework for the [Gamdom](https://gamdom.com) iGaming platform, covering UI tests and JIRA REST API tests. Built with Playwright and TypeScript, using bun as the runtime.

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Git

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd gamdom-qa-automation

# Install dependencies
bun install

# Install Playwright browsers
bunx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

## Running Tests

```bash
# Run all tests
bunx playwright test

# Run only UI tests
bunx playwright test --project=ui

# Run only API tests
bunx playwright test --project=api

# Run with headed browser (UI tests)
bunx playwright test --project=ui --headed

# Run a specific test file
bunx playwright test tests/api/jira-issues.spec.ts

# View HTML report
bunx playwright show-report
```

## Project Structure

```
├── src/
│   ├── pages/              # Page Object classes
│   │   ├── base.page.ts    # Abstract base with shared navigation/wait helpers
│   │   ├── home.page.ts    # Homepage — composes Header, CookieBanner, Search
│   │   └── sports.page.ts  # Sports betting section
│   ├── components/         # Reusable UI component abstractions
│   │   ├── header.component.ts
│   │   ├── cookie-banner.component.ts
│   │   └── search.component.ts
│   ├── api/                # API client layer
│   │   ├── base-api.client.ts    # Abstract base with typed HTTP methods
│   │   └── jira-issues.client.ts # JIRA Issues endpoints (CRUD)
│   ├── fixtures/           # Custom Playwright test fixtures
│   │   ├── ui.fixture.ts   # Injects page objects into UI tests
│   │   └── api.fixture.ts  # Injects API clients into API tests
│   ├── models/             # TypeScript type definitions
│   │   └── jira.types.ts   # JIRA API request/response interfaces
│   └── helpers/            # Utilities
│       └── test-data.builder.ts  # Builder pattern for JIRA issue payloads
├── tests/
│   ├── ui/                 # UI E2E test specs
│   └── api/                # API test specs
├── docs/
│   ├── exploratory-testing.md  # 5 critical business areas analysis
│   └── complex-scenario.md     # Complex scenario deep-dive
└── playwright.config.ts    # Two projects: ui (browser) + api (request-only)
```

## Design Patterns

### Page Object Model (POM)

Each page is represented by a class that encapsulates its selectors and interactions. Tests never touch raw selectors — they interact through page object methods. This provides a single place to update when the UI changes.

### Component Composition

Rather than creating deep inheritance hierarchies, page objects **compose** reusable components. For example, `HomePage` contains a `HeaderComponent`, `CookieBannerComponent`, and `SearchComponent`. This mirrors how modern UIs are built (component trees) and avoids the "god page object" anti-pattern.

### Custom Playwright Fixtures

Playwright's fixture system is used for dependency injection. Tests declare what they need (`homePage`, `jiraIssues`) and fixtures handle instantiation and teardown. This keeps tests clean and decouples them from object construction.

### Builder Pattern

The `IssueBuilder` class provides a fluent API for constructing JIRA issue payloads. This makes test data creation readable and maintainable — new fields can be added without modifying existing tests.

### Base Client Pattern

`BaseApiClient` provides typed HTTP methods (`get<T>`, `post<T>`, etc.) with centralized response parsing and error handling. Domain-specific clients like `JiraIssuesClient` extend it to add endpoint-specific methods. This keeps API interaction logic DRY and type-safe.

### A Note on the Screenplay Pattern

The Screenplay pattern (Actor-Task-Question) was considered as an alternative to POM. It excels at modeling complex multi-actor workflows and provides excellent readability for business stakeholders. However, for the scope of this framework (3 UI tests, 5 API tests), Screenplay would introduce unnecessary abstraction layers (Actors, Abilities, Tasks, Questions) without proportional benefit. POM with component composition achieves the same separation of concerns with less ceremony. That said, for a production-scale framework with 100+ tests and multiple user personas, Screenplay would be worth re-evaluating — particularly for scenarios like "Admin creates a promo, Player claims it, Admin verifies redemption".

## Scaling Strategy

### Horizontal Test Growth
- **Add new page objects** as new sections are tested (e.g., `PromotionsPage`, `ProfilePage`)
- **Extract shared components** when patterns repeat across pages
- **Add new API clients** following the same `BaseApiClient` → domain client pattern

### CI/CD Integration
- The Playwright config already supports `CI` environment variable for retry/worker tuning
- Add GitHub Actions / GitLab CI pipeline with `bunx playwright test`
- Use `blob-report` reporter for CI artifact collection
- Parallelize UI and API projects across CI jobs

### Test Data Management
- Extend `IssueBuilder` pattern to other domains (e.g., `UserBuilder`, `BetBuilder`)
- Consider a test data seeding layer for complex preconditions
- Implement cleanup hooks (`afterAll`) for API tests that create persistent data

### Environment Management
- `.env.example` documents all required variables
- Add `.env.staging`, `.env.production` for multi-environment runs
- Bun loads environment-specific files automatically based on `NODE_ENV`

### Reporting
- Current: HTML + list reporters
- Scale: Add Allure reporter for richer dashboards, trend analysis, and test categorization
- Add custom annotations for linking tests to JIRA tickets
```

**Step 4: Commit**

```bash
git add docs/ README.md
git commit -m "docs: add exploratory testing, complex scenario, and README"
```

---

### Task 11: Final Verification

**Step 1: Run full test suite**

```bash
bunx playwright test
```

**Step 2: Verify HTML report generates**

```bash
bunx playwright show-report
```

**Step 3: Final commit if any adjustments needed**
