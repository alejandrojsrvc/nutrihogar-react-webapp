import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

describe('EditMealPage', () => {
  it('keeps historical items visible while disabling the edit action', async () => {
    mockMealRequests({ foodId: null, status: 'CONFIRMED' });

    renderRoute(
      '/app/comidas/meal-1',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(await screen.findByText('Arroz cocido')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Editar comida' }),
    ).toBeDisabled();
    expect(screen.getByText(/captura histórica/)).toBeInTheDocument();
  });

  it.each([
    {
      foodId: null,
      reason: /captura histórica/,
      status: 'CONFIRMED',
    },
    {
      foodId: 'food-1',
      reason: /comidas canceladas/,
      status: 'CANCELLED',
    },
  ])(
    'keeps editing unavailable for $status meals with food $foodId',
    async ({ foodId, reason, status }) => {
      mockMealRequests({ foodId, status });

      renderRoute(
        '/app/comidas/meal-1/editar',
        createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
      );

      expect(
        await screen.findByRole('heading', { name: 'Edición no disponible' }),
      ).toBeInTheDocument();
      expect(screen.getByText(reason)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Guardar cambios' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Volver al detalle' }),
      ).toHaveAttribute('href', '/app/comidas/meal-1');
    },
  );
});

function mockMealRequests({
  foodId,
  status,
}: {
  foodId: string | null;
  status: string;
}) {
  vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
    const request = new Request(input, init);

    if (request.url.endsWith('/api/households')) {
      return jsonResponse([
        {
          currency: 'ARS',
          id: 'household-1',
          name: 'Hogar',
          timezone: 'UTC',
        },
      ]);
    }

    if (request.url.includes('/adult-profiles')) {
      return jsonResponse([
        {
          activityLevel: 'MODERATE',
          age: 32,
          biologicalSex: 'MALE',
          birthDate: '1994-01-01',
          createdAt: '2026-07-01',
          dietaryRestrictions: [],
          hasKitchenScale: true,
          heightCm: 175,
          householdId: 'household-1',
          id: 'profile-1',
          isActive: true,
          name: 'Alejandro',
          primaryGoal: 'MAINTENANCE',
          updatedAt: '2026-07-01',
          userId: 'user-1',
          weightKg: 75,
        },
      ]);
    }

    if (request.url.endsWith('/api/meals/meal-1')) {
      return jsonResponse({
        adultProfileId: 'profile-1',
        consumedAt: '2026-08-04T13:00:00.000Z',
        householdId: 'household-1',
        id: 'meal-1',
        items: [
          {
            baseQuantity: 100,
            baseUnit: 'GRAM',
            foodId,
            id: 'item-1',
            measurementMethod: 'WEIGHED',
            nameSnapshot: 'Arroz cocido',
            nutrients: [],
            quantity: 100,
            unit: 'GRAM',
          },
        ],
        mealType: 'LUNCH',
        source: 'MANUAL',
        status,
        totals: {
          carbohydrateGrams: 28,
          calories: 130,
          fatGrams: 0,
          fiberGrams: 0,
          proteinGrams: 2.7,
        },
      });
    }

    return jsonResponse({ status: 'ok' });
  });
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
