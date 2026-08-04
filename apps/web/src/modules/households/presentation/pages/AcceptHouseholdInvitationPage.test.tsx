import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

function householdResponse(): Response {
  return new Response(
    JSON.stringify([
      {
        currency: 'ARS',
        id: 'household-1',
        name: 'Hogar Sojo',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    ]),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
}

describe('AcceptHouseholdInvitationPage', () => {
  it('accepts an invitation with the authenticated session', async () => {
    const user = userEvent.setup();
    let acceptedRequest: Request | undefined;

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
        return householdResponse();
      }

      if (request.url.includes('/household-invitations/')) {
        acceptedRequest = request;
        return new Response(
          JSON.stringify({
            id: 'invitation-1',
            householdId: 'household-2',
            email: 'adult@example.com',
            role: 'MEMBER',
            status: 'ACCEPTED',
            expiresAt: '2099-08-06T12:00:00.000Z',
            invitedById: 'user-1',
            acceptedById: 'user-2',
            createdAt: '2026-07-30T12:00:00.000Z',
            updatedAt: '2026-07-30T12:00:00.000Z',
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        );
      }

      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    });

    renderRoute(
      '/invitaciones/raw-invitation-token',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-2' }),
    );

    await user.click(
      await screen.findByRole('button', { name: 'Aceptar invitación' }),
    );

    expect(
      await screen.findByRole('link', { name: 'Continuar configuración' }),
    ).toHaveAttribute('href', '/onboarding');
    expect(acceptedRequest?.url).toBe(
      'http://localhost:3000/api/household-invitations/raw-invitation-token/accept',
    );
  });

  it('explains when the invitation has expired', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.includes('/household-invitations/')) {
        return new Response(null, { status: 410 });
      }

      return request.url.endsWith('/api/households')
        ? householdResponse()
        : new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    });

    renderRoute(
      '/invitaciones/expired-token',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-2' }),
    );

    await user.click(
      await screen.findByRole('button', { name: 'Aceptar invitación' }),
    );

    expect(
      await screen.findByText(
        'La invitación ha expirado. Solicita una nueva invitación.',
      ),
    ).toBeInTheDocument();
  });
});
