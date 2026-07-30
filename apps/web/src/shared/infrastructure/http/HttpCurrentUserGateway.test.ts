import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpCurrentUserGateway } from './HttpCurrentUserGateway';

function currentUserResponse(): Response {
  return new Response(
    JSON.stringify({
      id: 'user-1',
      email: 'adult@example.com',
      displayName: 'Alejandro',
      avatarUrl: null,
      timezone: 'America/Argentina/Buenos_Aires',
      locale: 'es-AR',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  );
}

describe('HttpCurrentUserGateway', () => {
  it('gets the authenticated user with the bearer token', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return currentUserResponse();
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
      getAccessToken: () => 'test-token',
    });

    await expect(
      new HttpCurrentUserGateway(apiClient).getCurrentUser(),
    ).resolves.toEqual({
      avatarUrl: null,
      displayName: 'Alejandro',
      email: 'adult@example.com',
      id: 'user-1',
      locale: 'es-AR',
      timezone: 'America/Argentina/Buenos_Aires',
    });

    expect(request?.url).toBe('http://localhost:3000/api/users/me');
    expect(request?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('normalizes an unauthorized response', async () => {
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }),
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpCurrentUserGateway(apiClient).getCurrentUser(),
    ).rejects.toMatchObject({
      kind: 'http',
      status: 401,
    });
  });
});
