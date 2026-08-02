import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

function mockHouseholdAndHealthRequests(): void {
  vi.mocked(globalThis.fetch).mockImplementation(
    async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
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
      }

      if (request.url.includes('/adult-profiles')) {
        return new Response(
          JSON.stringify([
            {
              activityLevel: 'MODERATE',
              age: 36,
              biologicalSex: 'MALE',
              birthDate: '1990-05-20',
              dietaryRestrictions: [],
              hasKitchenScale: true,
              heightCm: 175.5,
              householdId: 'household-1',
              id: 'profile-1',
              isActive: true,
              name: 'Alejandro',
              primaryGoal: 'FAT_LOSS',
              updatedAt: '2026-07-30T17:00:00.000Z',
              createdAt: '2026-07-30T17:00:00.000Z',
              userId: 'user-1',
            },
          ]),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          },
        );
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
    },
  );
}

describe('HomePage', () => {
  it('consumes the health endpoint through the application flow', async () => {
    mockHouseholdAndHealthRequests();
    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(await screen.findByText('API disponible.')).toBeInTheDocument();
    expect(screen.getByText('Hogar Sojo')).toBeInTheDocument();
    expect(await screen.findByText('Alejandro')).toBeInTheDocument();
    expect(screen.getByText('Integrantes')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Inventario/ }).some((link) => link.getAttribute('href') === '/app/inventario')).toBe(true);
    expect(screen.getAllByRole('link', { name: /Lista de compras/ }).some((link) => link.getAttribute('href') === '/app/lista-de-compras')).toBe(true);
    expect(screen.getAllByRole('link', { name: /Historial de compras/ }).some((link) => link.getAttribute('href') === '/app/compras')).toBe(true);
  });

  it('shows a readable message when the API is unavailable', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
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
      }

      throw new TypeError('Failed to fetch');
    });

    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByText('No se pudo conectar con la API de NutriHogar.'),
    ).toBeInTheDocument();
  });
});
