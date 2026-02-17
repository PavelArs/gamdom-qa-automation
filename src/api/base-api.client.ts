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
