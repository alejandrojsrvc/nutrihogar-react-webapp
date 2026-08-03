import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

describe('OnboardingPage', () => {
  it('creates a household and continues with the adult profile', async () => {
    const user = userEvent.setup();
    let createRequest: Request | undefined;

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households') && request.method === 'GET') {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      if (
        request.url.endsWith('/api/households') &&
        request.method === 'POST'
      ) {
        createRequest = request;
        return new Response(
          JSON.stringify({
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar Sojo',
            timezone: 'America/Argentina/Buenos_Aires',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 201,
          },
        );
      }

      if (request.url.includes('/adult-profiles')) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

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
    });

    renderRoute(
      '/onboarding',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.type(
      await screen.findByLabelText('Nombre del hogar'),
      'Hogar Sojo',
    );
    await user.click(screen.getByRole('button', { name: 'Crear hogar' }));

    expect(
      await screen.findByRole('heading', { name: 'Configura tu perfil' }),
    ).toBeInTheDocument();
    await expect(createRequest?.json()).resolves.toEqual({
      currency: 'ARS',
      name: 'Hogar Sojo',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });

  it('shows the API error when household creation fails', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households') && request.method === 'GET') {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      if (
        request.url.endsWith('/api/households') &&
        request.method === 'POST'
      ) {
        return new Response(JSON.stringify({ message: 'Unavailable' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        });
      }

      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    });

    renderRoute(
      '/onboarding',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.type(
      await screen.findByLabelText('Nombre del hogar'),
      'Hogar Sojo',
    );
    await user.click(screen.getByRole('button', { name: 'Crear hogar' }));

    expect(
      await screen.findByText('La API respondio con el estado 503.'),
    ).toBeInTheDocument();
  });

  it('lets a user select a household before completing the profile', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
        return new Response(
          JSON.stringify([
            {
              currency: 'ARS',
              id: 'household-1',
              name: 'Hogar principal',
              timezone: 'America/Argentina/Buenos_Aires',
            },
            {
              currency: 'USD',
              id: 'household-2',
              name: 'Hogar de vacaciones',
              timezone: 'America/New_York',
            },
          ]),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        );
      }

      if (request.url.includes('/adult-profiles')) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    });

    renderRoute(
      '/onboarding',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Elige un hogar para continuar',
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /Hogar de vacaciones/ }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Configura tu perfil' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hogar de vacaciones')).toBeInTheDocument();
  });
});
