import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpHealthGateway } from './HttpHealthGateway';

function healthResponse(): Response {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: '2026-07-29T17:00:00.000Z',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  );
}

describe('HttpHealthGateway', () => {
  it('calls health with the configured base URL and bearer token', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return healthResponse();
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
      getAccessToken: () => 'test-token',
    });

    const result = await new HttpHealthGateway(apiClient).check();

    expect(result.status).toBe('ok');
    expect(request?.url).toBe('http://localhost:3000/api/health');
    expect(request?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('normalizes a network failure', async () => {
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpHealthGateway(apiClient).check(),
    ).rejects.toMatchObject({
      kind: 'network',
    });
  });

  it('normalizes an HTTP failure with its status', async () => {
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: 'Unavailable' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        }),
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpHealthGateway(apiClient).check(),
    ).rejects.toMatchObject({
      kind: 'http',
      status: 503,
    });
  });
});
