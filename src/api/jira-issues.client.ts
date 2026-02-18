import { BaseApiClient } from './base-api.client';
import type {
  CreateIssuePayload,
  UpdateIssuePayload,
  IssueResponse,
  SearchResponse,
} from '@models/jira.types';

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
    return this.get<SearchResponse>('/rest/api/3/search/jql', {
      jql,
      maxResults: maxResults.toString(),
      fields: 'summary,priority,labels,status',
    });
  }
}
