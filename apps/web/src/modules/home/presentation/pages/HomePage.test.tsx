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

  it('shows a compact inventory pulse with shopping and sync context', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname.endsWith('/api/households')) return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar Sojo', timezone: 'UTC' }]);
      if (pathname.includes('/adult-profiles')) return jsonResponse([{ activityLevel: 'MODERATE', age: 36, biologicalSex: 'MALE', birthDate: '1990-05-20', dietaryRestrictions: [], hasKitchenScale: true, heightCm: 175, householdId: 'household-1', id: 'profile-1', isActive: true, name: 'Alejandro', primaryGoal: 'MAINTENANCE', updatedAt: '2026-08-01T12:00:00.000Z', createdAt: '2026-08-01T12:00:00.000Z', userId: 'user-1' }]);
      if (pathname.endsWith('/inventory')) return jsonResponse({ items: [{ currentQuantity: 0, id: 'item-1', itemType: 'FOOD', name: 'Arroz', status: 'DEPLETED', unit: 'GRAM', version: 1 }], limit: 20, page: 1, total: 1 });
      if (pathname.endsWith('/prepared-leftovers')) return jsonResponse([{ availableWeight: 250, id: 'leftover-1', status: 'AVAILABLE' }]);
      if (pathname.endsWith('/shopping-list')) return jsonResponse({ items: [{ id: 'shopping-1', name: 'Leche', purchased: false, quantity: 1, source: 'MANUAL', unit: 'UNIT' }] });
      return jsonResponse({ consumed: { calories: 0 }, meals: [], profile: { name: 'Alejandro' }, status: 'ok', timestamp: '2026-08-01T12:00:00.000Z' });
    });

    renderRoute('/app', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));

    expect(await screen.findByRole('heading', { name: 'Lo que requiere atención' })).toBeInTheDocument();
    expect(screen.getByText('Agotados')).toBeInTheDocument();
    expect(screen.getByText('Por comprar')).toBeInTheDocument();
    expect(screen.getByText('Arroz')).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status: 200 });
}
