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
bun run test

# Run only UI tests
bun run test:ui

# Run only API tests
bun run test:api

# Run with headed browser (UI tests)
bun run test:headed

# Run a specific test file
bunx playwright test tests/api/jira-issues.spec.ts

# View HTML report
bun run report
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

The Screenplay pattern (Actor-Task-Question) was considered as an alternative to POM. It excels at modeling complex multi-actor workflows and provides excellent readability for business stakeholders. However, for the scope of this framework (3 UI tests, 5 API tests), Screenplay would introduce unnecessary abstraction layers (Actors, Abilities, Tasks, Questions) without proportional benefit. POM with component composition achieves the same separation of concerns with less ceremony.

That said, for a production-scale framework with hundreds of tests and multiple user personas, Screenplay would be worth re-evaluating — particularly for scenarios like "Admin creates a promo, Player claims it, Admin verifies redemption" where the actor model provides natural test readability and role separation.

## Scaling Strategy

### Horizontal Test Growth

- **Add new page objects** as new sections are tested (e.g., `PromotionsPage`, `ProfilePage`)
- **Extract shared components** when patterns repeat across pages
- **Add new API clients** following the same `BaseApiClient` -> domain client pattern

### CI/CD Integration

- The Playwright config already supports `CI` environment variable for retry/worker tuning
- Add GitHub Actions / GitLab CI pipeline with `bun run test`
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
