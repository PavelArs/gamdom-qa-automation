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
