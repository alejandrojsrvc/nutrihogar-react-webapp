import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@nutrihogar/api-client';
import { HttpRecipeGateway } from './HttpRecipeGateway';

describe('HttpRecipeGateway', () => {
  it('sends household, search and filters when listing recipes', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async (input, init) => { request = new Request(input, init); return new Response(JSON.stringify({ items: [], limit: 20, page: 1, total: 0 }), { headers: { 'Content-Type': 'application/json' }, status: 200 }); });
    const apiClient = createApiClient({ baseUrl: 'http://localhost:3000', fetch: fetchImplementation });
    await new HttpRecipeGateway(apiClient).list('household-1', { category: 'LUNCH', limit: 20, page: 1, query: 'arroz' });
    const url = new URL(request?.url ?? '');
    expect(url.pathname).toBe('/api/households/household-1/recipes');
    expect(url.searchParams.get('category')).toBe('LUNCH');
    expect(url.searchParams.get('status')).toBeNull();
  });
});
