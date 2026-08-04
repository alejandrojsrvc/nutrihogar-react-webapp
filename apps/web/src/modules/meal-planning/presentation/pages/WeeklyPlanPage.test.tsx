import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

describe('WeeklyPlanPage', () => {
  it('renders the weekly calendar and an action for empty slots', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname === '/api/households')
        return jsonResponse([
          {
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar',
            timezone: 'UTC',
          },
        ]);
      if (pathname.endsWith('/weekly-plans'))
        return jsonResponse({
          items: [
            {
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
                    { adultProfileId: 'profile-1', id: 'participant-1' },
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
            },
          ],
          limit: 20,
          page: 1,
          total: 1,
        });
      return jsonResponse({ items: [], limit: 20, page: 1, total: 0 });
    });

    renderRoute(
      '/app/plan-semanal?semana=2026-08-03',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Plan semanal' }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText('Arroz familiar')).not.toHaveLength(0);
    expect(
      screen.getAllByRole('link', { name: 'Agregar comida' }),
    ).not.toHaveLength(0);
    expect(screen.getAllByText(/1 participante/)).not.toHaveLength(0);
    expect(screen.getAllByText('Planificada')).not.toHaveLength(0);
    expect(
      screen.getByRole('navigation', { name: 'Resumen del plan' }),
    ).toHaveTextContent('Comparar inventario');
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
