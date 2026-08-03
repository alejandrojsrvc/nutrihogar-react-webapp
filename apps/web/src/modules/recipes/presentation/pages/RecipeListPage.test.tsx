import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

describe('RecipeListPage', () => {
  it('lists recipes and sends search and filters', async () => {
    const user = userEvent.setup();
    const requests: URL[] = [];
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const url = new URL(request.url);
      requests.push(url);
      if (url.pathname === '/api/households')
        return json([
          {
            id: 'household-1',
            name: 'Hogar',
            currency: 'ARS',
            timezone: 'America/Argentina/Buenos_Aires',
          },
        ]);
      if (url.pathname.includes('/adult-profiles')) return json([]);
      return json({
        items: [
          {
            createdAt: '',
            createdById: 'user-1',
            defaultServings: 4,
            estimatedPreparationMinutes: 45,
            householdId: 'household-1',
            id: 'recipe-1',
            ingredients: [
              {
                id: 'ingredient-1',
                foodId: 'food-1',
                quantity: 100,
                unit: 'GRAM',
                position: 1,
              },
            ],
            instructions: [],
            name: 'Arroz familiar',
            status: 'ACTIVE',
            tags: [],
            updatedAt: '',
          },
        ],
        limit: 12,
        page: 1,
        total: 1,
      });
    });
    renderRoute(
      '/app/recetas',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );
    expect(
      await screen.findByRole('link', { name: /Arroz familiar/ }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText('Buscar receta'), 'arroz');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'LUNCH');
    await waitFor(() =>
      expect(
        requests.some(
          (url) =>
            url.searchParams.get('category') === 'LUNCH' &&
            url.searchParams.get('query') === 'arroz',
        ),
      ).toBe(true),
    );
    expect(
      requests.every((url) => url.searchParams.get('status') === null),
    ).toBe(true);
  });
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
