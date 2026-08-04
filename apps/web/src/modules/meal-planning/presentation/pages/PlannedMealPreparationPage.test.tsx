import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

describe('PlannedMealPreparationPage', () => {
  it('offers to start when the preparation does not exist', async () => {
    mockPreparationRequest(404);

    renderPreparationRoute();

    expect(
      await screen.findByRole('button', { name: 'Iniciar preparación' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No se pudo consultar la preparación de esta comida.'),
    ).not.toBeInTheDocument();
  });

  it('shows a retry state when the preparation query fails', async () => {
    mockPreparationRequest(503);

    renderPreparationRoute();

    expect(
      await screen.findByText(
        'No se pudo consultar la preparación de esta comida.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Iniciar preparación' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
  });
});

function renderPreparationRoute() {
  return renderRoute(
    '/app/plan-semanal/plan-1/comidas/meal-1/preparar',
    createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
  );
}

function mockPreparationRequest(status: number) {
  vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
    const request = new Request(input, init);
    const pathname = new URL(request.url).pathname;
    if (pathname === '/api/households') return jsonResponse([household()]);
    if (pathname.includes('/adult-profiles')) return jsonResponse([]);
    if (pathname === '/api/weekly-plans/plan-1')
      return jsonResponse(planResponse());
    if (pathname === '/api/planned-meals/meal-1/preparation' && status === 404)
      return new Response(null, { status });
    if (pathname === '/api/planned-meals/meal-1/preparation')
      return jsonResponse({ message: 'Preparation unavailable' }, status);
    return jsonResponse({ items: [], limit: 20, page: 1, total: 0 });
  });
}

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
        participants: [],
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
