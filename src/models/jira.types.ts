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
  issues: IssueResponse[];
  nextPageToken?: string;
  isLast: boolean;
}
