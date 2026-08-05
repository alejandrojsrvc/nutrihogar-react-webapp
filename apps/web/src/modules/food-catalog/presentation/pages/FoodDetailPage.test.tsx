import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

const category = {
  code: 'MEAT',
  displayOrder: 1,
  id: 'category-meat',
  name: 'Carnes',
};

const customFood = {
  aliases: [],
  brand: 'Receta familiar',
  carbohydrateGrams: 40,
  category,
  confidenceLevel: 'USER_PROVIDED',
  description: null,
  energyKcal: 250,
  fatGrams: 4,
  foodType: 'CUSTOM',
  householdId: 'household-1',
  id: 'food-custom-1',
  isGlobal: false,
  name: 'Pan casero',
  nutrients: [],
  preparationState: 'RAW',
  proteinGrams: 8,
  referenceQuantity: 100,
  referenceUnit: 'GRAM',
  servings: [],
  source: 'USER',
  sourceReference: null,
};

describe('FoodDetailPage', () => {
  it('offers custom food actions and confirms logical deletion', async () => {
    const user = userEvent.setup();
    const requests: Request[] = [];
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);

      if (request.url.endsWith('/api/households')) {
        return jsonResponse([
          {
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar Sojo',
            timezone: 'America/Argentina/Buenos_Aires',
          },
        ]);
      }

      if (request.url.endsWith('/api/foods/food-custom-1')) {
        return jsonResponse(customFood);
      }

      if (request.method === 'DELETE') {
        return new Response(null, { status: 204 });
      }

      if (request.url.endsWith('/api/food-categories')) {
        return jsonResponse([category]);
      }

      return jsonResponse({
        items: [],
        pagination: { limit: 12, page: 1, total: 0 },
      });
    });

    renderRoute(
      '/app/alimentos/food-custom-1',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Pan casero' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Editar alimento' }),
    ).toHaveAttribute('href', '/app/alimentos/food-custom-1/editar');

    await user.click(screen.getByRole('button', { name: 'Eliminar alimento' }));
    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Eliminar Pan casero de tu catálogo?',
    );
    expect(requests.some((request) => request.method === 'DELETE')).toBe(false);

    confirmSpy.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Eliminar alimento' }));
    await waitFor(() => {
      expect(requests.some((request) => request.method === 'DELETE')).toBe(
        true,
      );
    });
    expect(
      await screen.findByRole('heading', { name: 'No encontramos alimentos' }),
    ).toBeInTheDocument();
  });

  it('shows inventory feedback when the food was created from a nutrition label', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
        return jsonResponse([
          {
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar Sojo',
            timezone: 'America/Argentina/Buenos_Aires',
          },
        ]);
      }

      if (request.url.endsWith('/api/foods/food-custom-1')) {
        return jsonResponse(customFood);
      }

      if (request.url.endsWith('/api/food-categories')) {
        return jsonResponse([category]);
      }

      return jsonResponse({
        items: [],
        pagination: { limit: 12, page: 1, total: 0 },
      });
    });

    renderRoute(
      '/app/alimentos/food-custom-1',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
      undefined,
      { foodSaved: true, inventoryAdded: true },
    );

    expect(
      await screen.findByText(
        'El alimento se guardó y se agregó a tu inventario.',
      ),
    ).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
