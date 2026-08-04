import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

function mockHouseholdAndHealthRequests(): void {
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

    if (request.url.includes('/daily-nutrition-summary')) {
      return new Response(
        JSON.stringify({
          consumed: {
            dailyCalories: 1420,
            proteinGrams: 102,
            carbohydrateGrams: 120,
            fatGrams: 42,
          },
          date: '2026-08-03',
          goal: {
            dailyCalories: 2150,
            proteinGrams: 160,
            carbohydrateGrams: 190,
            fatGrams: 70,
          },
          meals: [],
          profileId: 'profile-1',
          profileName: 'Alejandro',
        }),
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
        consumed: {
          dailyCalories: 1420,
          proteinGrams: 102,
          carbohydrateGrams: 120,
          fatGrams: 42,
        },
        date: '2026-08-03',
        goal: {
          dailyCalories: 2150,
          proteinGrams: 160,
          carbohydrateGrams: 190,
          fatGrams: 70,
        },
        meals: [],
        profileId: 'profile-1',
        profileName: 'Alejandro',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  });
}

describe('HomePage', () => {
  it('consumes the health endpoint through the application flow', async () => {
    mockHouseholdAndHealthRequests();
    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Hoy' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('Menú de Alejandro'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'En casa' }),
    ).toBeInTheDocument();
    const consumedCalories = await screen.findByText('1.420 kcal');
    expect(consumedCalories.parentElement).toHaveTextContent(
      '1.420 kcal consumidas',
    );
    expect(screen.getByRole('heading', { name: 'Hoy' })).toBeInTheDocument();
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
      const pathname = new URL(request.url).pathname.replace(/\/+$/, '');
      if (pathname.endsWith('/api/households'))
        return jsonResponse([
          {
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar Sojo',
            timezone: 'UTC',
          },
        ]);
      if (pathname.includes('/daily-nutrition-summary'))
        return jsonResponse({
          consumed: { calories: 0 },
          date: '2026-08-01',
          goal: null,
          meals: [],
          profileId: 'profile-1',
          profileName: 'Alejandro',
          remaining: null,
        });
      if (pathname.includes('/adult-profiles'))
        return jsonResponse([
          {
            activityLevel: 'MODERATE',
            age: 36,
            biologicalSex: 'MALE',
            birthDate: '1990-05-20',
            dietaryRestrictions: [],
            hasKitchenScale: true,
            heightCm: 175,
            householdId: 'household-1',
            id: 'profile-1',
            isActive: true,
            name: 'Alejandro',
            primaryGoal: 'MAINTENANCE',
            updatedAt: '2026-08-01T12:00:00.000Z',
            createdAt: '2026-08-01T12:00:00.000Z',
            userId: 'user-1',
          },
        ]);
      if (pathname.endsWith('/inventory'))
        return jsonResponse({
          items: [
            {
              currentQuantity: 0,
              id: 'item-1',
              itemType: 'FOOD',
              name: 'Arroz',
              status: 'DEPLETED',
              unit: 'GRAM',
              version: 1,
            },
          ],
          limit: 20,
          page: 1,
          total: 1,
        });
      if (pathname.endsWith('/prepared-leftovers'))
        return jsonResponse([
          { availableWeight: 250, id: 'leftover-1', status: 'AVAILABLE' },
        ]);
      if (pathname.endsWith('/shopping-list'))
        return jsonResponse({
          items: [
            {
              id: 'shopping-1',
              name: 'Leche',
              purchased: false,
              quantity: 1,
              source: 'MANUAL',
              unit: 'UNIT',
            },
          ],
        });
      return jsonResponse({ status: 'ok' });
    });

    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Comidas de hoy' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'En casa' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Registrar comida/ }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('/app/comidas/nueva?profileId=profile-1'),
    );
    expect(await screen.findByText('Arroz')).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
