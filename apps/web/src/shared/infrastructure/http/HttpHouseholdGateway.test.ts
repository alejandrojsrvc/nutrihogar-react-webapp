import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpHouseholdGateway } from './HttpHouseholdGateway';

function householdResponse(status = 200): Response {
  return new Response(
    JSON.stringify({
      currency: 'ARS',
      id: 'household-1',
      name: 'Hogar Sojo',
      timezone: 'America/Argentina/Buenos_Aires',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status,
    },
  );
}

describe('HttpHouseholdGateway', () => {
  it('lists households with the bearer token', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify([
            {
              currency: 'ARS',
              id: 'household-1',
              name: 'Hogar Sojo',
              timezone: 'America/Argentina/Buenos_Aires',
            },
          ]),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
      getAccessToken: () => 'test-token',
    });

    await expect(new HttpHouseholdGateway(apiClient).list()).resolves.toEqual([
      {
        currency: 'ARS',
        id: 'household-1',
        name: 'Hogar Sojo',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    ]);

    expect(request?.url).toBe('http://localhost:3000/api/households');
    expect(request?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('creates a household with the form input', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return householdResponse(201);
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpHouseholdGateway(apiClient).create({
        currency: 'ARS',
        name: 'Hogar Sojo',
        timezone: 'America/Argentina/Buenos_Aires',
      }),
    ).resolves.toEqual({
      currency: 'ARS',
      id: 'household-1',
      name: 'Hogar Sojo',
      timezone: 'America/Argentina/Buenos_Aires',
    });

    expect(request?.method).toBe('POST');
    expect(request?.url).toBe('http://localhost:3000/api/households');
    await expect(request?.json()).resolves.toEqual({
      currency: 'ARS',
      name: 'Hogar Sojo',
      timezone: 'America/Argentina/Buenos_Aires',
    });
  });

  it('normalizes an unavailable households response', async () => {
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async () =>
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
      new HttpHouseholdGateway(apiClient).list(),
    ).rejects.toMatchObject({
      kind: 'http',
      status: 503,
    });
  });
});
