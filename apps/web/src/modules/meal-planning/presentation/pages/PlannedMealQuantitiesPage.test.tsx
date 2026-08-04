import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

describe('PlannedMealQuantitiesPage', () => {
  it('retains the entered quantity when saving fails', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname === '/api/households') return jsonResponse([household()]);
      if (pathname === '/api/weekly-plans/plan-1')
        return jsonResponse(planResponse());
      if (pathname.endsWith('/adult-profiles'))
        return jsonResponse([profileResponse()]);
      if (pathname === '/api/planned-meals/meal-1/quantities')
        return jsonResponse([]);
      if (
        pathname === '/api/planned-meal-participants/participant-1' &&
        request.method === 'PATCH'
      )
        return jsonResponse({ message: 'Unavailable' }, 503);
      return jsonResponse({ items: [], limit: 20, page: 1, total: 0 });
    });

    renderRoute(
      '/app/plan-semanal/plan-1/comidas/meal-1/cantidades',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    const quantity = await screen.findByLabelText('Cantidad confirmada');
    fireEvent.change(quantity, { target: { value: '2.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cantidad' }));

    expect(
      await screen.findByText(
        'No se pudo guardar la cantidad. El valor ingresado sigue aquí.',
      ),
    ).toBeInTheDocument();
    expect(quantity).toHaveValue(2.5);
  });
});

function household() {
  return {
    currency: 'ARS',
    id: 'household-1',
    name: 'Hogar',
    timezone: 'UTC',
  };
}

function planResponse() {
  return {
    createdAt: '2026-08-01T12:00:00.000Z',
    createdBy: 'user-1',
    householdId: 'household-1',
    id: 'plan-1',
    meals: [
      {
        createdAt: '2026-08-01T12:00:00.000Z',
        date: '2026-08-03',
        id: 'meal-1',
        nameSnapshot: 'Arroz familiar',
        notes: null,
        participants: [
          {
            adultProfileId: 'profile-1',
            confirmedQuantity: 1,
            confirmedUnit: 'SERVING',
            id: 'participant-1',
          },
        ],
        position: 0,
        recipeId: 'recipe-1',
        source: 'RECIPE',
        status: 'PLANNED',
        type: 'LUNCH',
        updatedAt: '2026-08-01T12:00:00.000Z',
      },
    ],
    status: 'DRAFT',
    updatedAt: '2026-08-01T12:00:00.000Z',
    weekEnd: '2026-08-09',
    weekStart: '2026-08-03',
  };
}

function profileResponse() {
  return {
    activityLevel: 'MODERATE',
    age: 36,
    biologicalSex: 'MALE',
    birthDate: '1990-05-20',
    createdAt: '2026-08-01T12:00:00.000Z',
    dietaryRestrictions: [],
    hasKitchenScale: true,
    heightCm: 175,
    householdId: 'household-1',
    id: 'profile-1',
    isActive: true,
    name: 'Alejandro',
    primaryGoal: 'MAINTENANCE',
    updatedAt: '2026-08-01T12:00:00.000Z',
    userId: 'user-1',
    weightKg: 75,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
