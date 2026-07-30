import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../../../test/renderRoute';

const category = {
  code: 'MEAT',
  displayOrder: 1,
  id: 'category-meat',
  name: 'Carnes',
};

const food = {
  brand: null,
  carbohydrateGrams: 0,
  category,
  energyKcal: 165,
  fatGrams: 3.6,
  foodType: 'GENERIC',
  householdId: null,
  id: 'food-chicken-cooked',
  name: 'Pollo cocido',
  preparationState: 'COOKED',
  proteinGrams: 31,
  referenceQuantity: 100,
  referenceUnit: 'GRAM',
};

describe('FoodCatalogPage', () => {
  it('searches with debounce and applies category and preparation filters', async () => {
    const user = userEvent.setup();
    const requests: URL[] = [];

    mockFoodRequests(requests, (url) => {
      const hasSearch = url.searchParams.get('query') === 'pollo';

      return {
        items: hasSearch ? [food] : [],
        pagination: {
          limit: 12,
          page: Number(url.searchParams.get('page')),
          total: hasSearch ? 1 : 0,
        },
      };
    });

    renderFoodCatalog();

    await user.type(await screen.findByLabelText('Buscar alimentos'), 'pollo');
    expect(await screen.findByRole('link', { name: /Pollo cocido/ })).toBeInTheDocument();
    expect(
      requests.some((url) => url.searchParams.get('query') === 'pollo'),
    ).toBe(true);

    await user.selectOptions(screen.getByLabelText('Categoria'), 'category-meat');
    await user.selectOptions(screen.getByLabelText('Preparacion'), 'COOKED');

    await waitFor(() => {
      expect(
        requests.some(
          (url) =>
            url.searchParams.get('categoryId') === 'category-meat' &&
            url.searchParams.get('preparationState') === 'COOKED',
        ),
      ).toBe(true);
    });
  });

  it('paginates results and shows an empty state', async () => {
    const user = userEvent.setup();
    const requests: URL[] = [];

    mockFoodRequests(requests, (url) => {
      const isEmpty = url.searchParams.get('query') === 'inexistente';
      return {
        items: isEmpty ? [] : [food],
        pagination: {
          limit: 12,
          page: Number(url.searchParams.get('page')),
          total: isEmpty ? 0 : 13,
        },
      };
    });

    renderFoodCatalog();

    expect(await screen.findByRole('link', { name: /Pollo cocido/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => {
      expect(
        requests.some((url) => url.searchParams.get('page') === '2'),
      ).toBe(true);
    });

    await user.clear(screen.getByLabelText('Buscar alimentos'));
    await user.type(screen.getByLabelText('Buscar alimentos'), 'inexistente');
    expect(
      await screen.findByRole('heading', { name: 'No encontramos alimentos' }),
    ).toBeInTheDocument();
  });

  it('navigates to a food detail page', async () => {
    mockFoodRequests([], () => ({
      items: [food],
      pagination: { limit: 12, page: 1, total: 1 },
    }));

    renderFoodCatalog('/app/alimentos/food-chicken-cooked');

    expect(
      await screen.findByRole('heading', { name: 'Pollo cocido' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Nutrientes principales')).toBeInTheDocument();
    expect(screen.getByText('Porciones')).toBeInTheDocument();
  });
});

function renderFoodCatalog(path = '/app/alimentos') {
  renderRoute(
    path,
    createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
  );
}

function mockFoodRequests(
  requests: URL[],
  searchResponse: (url: URL) => unknown,
) {
  vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    requests.push(url);

    if (url.pathname === '/api/food-categories') {
      return jsonResponse([category]);
    }

    if (url.pathname === '/api/foods/food-chicken-cooked') {
      return jsonResponse({
        ...food,
        aliases: ['Pechuga de pollo'],
        confidenceLevel: 'VERIFIED',
        description: 'Pollo cocido sin piel.',
        isGlobal: true,
        nutrients: [
          {
            amount: 165,
            id: 'nutrient-row-1',
            nutrientDefinition: {
              code: 'ENERGY_KCAL',
              displayOrder: 1,
              group: 'ENERGY',
              id: 'nutrient-energy',
              isRequired: true,
              name: 'Energia',
              unit: 'kcal',
            },
          },
        ],
        servings: [
          {
            equivalentGrams: 150,
            equivalentMilliliters: null,
            id: 'serving-1',
            name: 'Porcion',
            quantity: 1,
            unit: 'UNIT',
          },
        ],
        source: 'USDA',
        sourceReference: 'fdc-123',
      });
    }

    return jsonResponse(searchResponse(url));
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
