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
