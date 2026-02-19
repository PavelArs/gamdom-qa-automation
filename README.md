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

# Run a specific test file
bunx playwright test tests/api/jira-issues.spec.ts

# View HTML report
bun run report
```
## Design Patterns

### Page Object Model (POM)

Each page is represented by a class that encapsulates its selectors and interactions. Tests never touch raw selectors — they interact through page object methods. This provides a single place to update when the UI changes.

### Component Composition

Rather than creating deep inheritance hierarchies, page objects **compose** reusable components. For example, `HomePage` contains a `HeaderComponent`, and `SearchComponent`. This mirrors how modern UIs are built (component trees) and avoids the "god page object" anti-pattern.

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
- Parallelize UI and API projects across CI jobs, use sharding

### Test Data Management

- Consider a test data seeding layer for complex preconditions
- Implement cleanup hooks for API tests that create persistent data
- Use mocking via `page.route` for third-party APIs

### Reporting

- Current: HTML + list reporters
- Scale: Add Allure reporter for richer dashboards, trend analysis, and test categorization
- Add custom annotations for linking tests to JIRA tickets
