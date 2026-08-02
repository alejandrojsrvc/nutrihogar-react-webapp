import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../../../test/renderRoute';

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
    { headers: { 'Content-Type': 'application/json' }, status: 201 },
  );
}

describe('HouseholdInvitationsPage', () => {
  it('creates an invitation and displays its shareable link', async () => {
    const user = userEvent.setup();
    let created = false;
    let createRequest: Request | undefined;

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
        return householdResponse();
      }

      if (request.url.includes('/invitations')) {
        if (request.method === 'POST') {
          createRequest = request;
          created = true;
          return invitationResponse({ token: 'raw-invitation-token' });
        }

        return new Response(
          JSON.stringify(
            created
              ? [
                  {
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
                  },
                ]
              : [],
          ),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        );
      }

      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    });

    renderRoute(
      '/app/invitaciones',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.click(await screen.findByRole('button', { name: 'Invitar a alguien' }));
    await user.type(
      await screen.findByLabelText('Correo electronico'),
      'adult@example.com',
    );
    await user.selectOptions(screen.getByLabelText('Rol en el hogar'), 'ADMIN');
    await user.click(screen.getByRole('button', { name: 'Crear invitacion' }));

    expect(await screen.findByText('Invitacion lista')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Enlace de invitacion para adult@example.com'),
    ).toHaveValue(
      `${window.location.origin}/invitaciones/raw-invitation-token`,
    );
    await user.click(
      await screen.findByRole('button', { name: 'Recuperar enlace' }),
    );
    expect(
      await screen.findAllByLabelText('Enlace de invitacion para adult@example.com'),
    ).toHaveLength(2);
    expect(await createRequest?.json()).toEqual({
      email: 'adult@example.com',
      role: 'ADMIN',
    });
  });

  it('shows a clear message when the invitation cannot be created', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
        return householdResponse();
      }

      if (request.url.includes('/invitations') && request.method === 'POST') {
        return new Response(null, { status: 409 });
      }

      if (request.url.includes('/invitations')) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    });

    renderRoute(
      '/app/invitaciones',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.click(await screen.findByRole('button', { name: 'Invitar a alguien' }));
    await user.type(
      await screen.findByLabelText('Correo electronico'),
      'adult@example.com',
    );
    await user.click(screen.getByRole('button', { name: 'Crear invitacion' }));

    expect(
      await screen.findByText(
        'Ese correo ya pertenece al hogar o ya tiene una invitacion pendiente.',
      ),
    ).toBeInTheDocument();
  });
});
