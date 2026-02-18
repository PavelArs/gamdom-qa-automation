# QA Automation Framework Design - Gamdom

## Overview

Playwright + TypeScript automation framework for Gamdom iGaming platform covering UI E2E tests and JIRA REST API tests. Uses bun as runtime/package manager.

## Architecture: Page Object Model with Component Composition

### Project Structure

```
gamdom-qa-automation/
├── src/
│   ├── pages/                    # Page Objects
│   │   ├── base.page.ts          # Abstract base with common methods
│   │   ├── home.page.ts          # Homepage interactions
│   │   ├── login.page.ts         # Login/registration flows
│   │   └── sports.page.ts        # Sports betting section
│   ├── components/               # Reusable UI components
│   │   ├── header.component.ts   # Navigation header
│   │   ├── cookie-banner.component.ts
│   │   └── search.component.ts   # Game/sport search
│   ├── api/                      # API layer
│   │   ├── base-api.client.ts    # Base HTTP client with auth, logging
│   │   └── jira-issues.client.ts # Typed JIRA Issues API client
│   ├── fixtures/                 # Custom Playwright fixtures
│   │   ├── ui.fixture.ts         # Page object fixtures
│   │   └── api.fixture.ts        # API client fixtures
│   ├── models/                   # TypeScript interfaces/types
│   │   └── jira.types.ts         # JIRA API request/response types
│   └── helpers/                  # Utilities
│       └── test-data.builder.ts  # Builder pattern for test data
├── tests/
│   ├── ui/                       # UI test specs
│   │   ├── homepage.spec.ts
│   │   ├── navigation.spec.ts
│   │   └── search.spec.ts
│   └── api/
│       └── jira-issues.spec.ts   # JIRA CRUD workflow
├── docs/
│   ├── exploratory-testing.md    # 5 critical business areas
│   └── complex-scenario.md       # Complex scenario analysis
├── playwright.config.ts
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

### Design Patterns

- **Page Object Model**: Industry-standard UI abstraction. Each page/component encapsulates selectors and interactions.
- **Component Composition**: Pages compose reusable components (Header, CookieBanner) rather than inheriting everything.
- **Builder Pattern**: Test data construction for JIRA API payloads.
- **Custom Fixtures**: Playwright's DI mechanism for injecting page objects and API clients into tests.
- **Base Client Pattern**: Shared auth, error handling, and logging for API interactions.

### 5 Critical Business Areas

1. **User Authentication & Registration** - gateway to all functionality
2. **Deposit & Withdrawal** - directly tied to revenue
3. **Game Lobby & Navigation** - core engagement UX
4. **Sports Betting** - major business vertical
5. **Responsible Gambling Controls** - regulatory compliance

### UI Tests (3)

1. Homepage critical elements verification
2. Main section navigation
3. Game search/filtering

### JIRA API CRUD Workflow

Endpoints: Create (POST) -> Read (GET) -> Update (PUT) -> Search (GET/search) -> Delete (DELETE)
Serial execution with data dependency chain.

### Complex Scenario

Live Sports Betting with real-time odds changes - documented separately in docs/complex-scenario.md.

### Technical Decisions

- **bun** for speed and modern TS support
- **Custom fixtures** over raw page construction
- **Typed API responses** for full IntelliSense and compile-time safety
- **.env config** for environment portability
- **POM over Screenplay** - right tool for the scope (Screenplay acknowledged as alternative)
