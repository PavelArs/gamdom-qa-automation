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

  test('GET /search/jql — should find issue via JQL query', async ({ jiraIssues }) => {
    // JIRA search index has eventual consistency — poll until the issue is indexed
    const jql = `project = ${projectKey} AND key = ${createdIssueKey}`;

    await expect(async () => {
      const { status, body } = await jiraIssues.searchIssues(jql);
      expect(status).toBe(200);
      expect(body.issues.length).toBeGreaterThanOrEqual(1);
    }).toPass({ timeout: 15_000, intervals: [1_000, 2_000, 3_000] });

    // Final assertion with field validation
    const { body } = await jiraIssues.searchIssues(jql);
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
