import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpHouseholdInvitationGateway } from './HttpHouseholdInvitationGateway';

function invitationResponse(overrides: Record<string, unknown> = {}): Response {
  return new Response(
    JSON.stringify({
      id: 'invitation-1',
      householdId: 'household-1',
      email: 'adult@example.com',
      role: 'MEMBER',
      status: 'PENDING',
      expiresAt: '2099-08-06T12:00:00.000Z',
      invitedById: 'user-1',
      acceptedById: null,
      createdAt: '2026-07-30T12:00:00.000Z',
      updatedAt: '2026-07-30T12:00:00.000Z',
      ...overrides,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  );
}

describe('HttpHouseholdInvitationGateway', () => {
  it('lists invitations for the selected household', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify([JSON.parse(await invitationResponse().text())]),
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

    await expect(
      new HttpHouseholdInvitationGateway(apiClient).list('household-1'),
    ).resolves.toEqual([
      expect.objectContaining({
        email: 'adult@example.com',
        status: 'PENDING',
      }),
    ]);

    expect(request?.url).toBe(
      'http://localhost:3000/api/households/household-1/invitations',
    );
    expect(request?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('creates an invitation with the email and role', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return invitationResponse({ token: 'raw-invitation-token' });
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpHouseholdInvitationGateway(apiClient).create('household-1', {
        email: 'adult@example.com',
        role: 'ADMIN',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        role: 'MEMBER',
        token: 'raw-invitation-token',
      }),
    );

    expect(request?.url).toBe(
      'http://localhost:3000/api/households/household-1/invitations',
    );
    expect(await request?.json()).toEqual({
      email: 'adult@example.com',
      role: 'ADMIN',
    });
  });

  it('accepts an invitation by token', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return invitationResponse({
          status: 'ACCEPTED',
          acceptedById: 'user-2',
        });
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
      getAccessToken: () => 'test-token',
    });

    await expect(
      new HttpHouseholdInvitationGateway(apiClient).accept(
        'raw-invitation-token',
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        acceptedById: 'user-2',
        status: 'ACCEPTED',
      }),
    );

    expect(request?.url).toBe(
      'http://localhost:3000/api/household-invitations/raw-invitation-token/accept',
    );
    expect(request?.headers.get('Authorization')).toBe('Bearer test-token');
  });
});
