import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpFoodCatalogGateway } from './HttpFoodCatalogGateway';

const category = {
  code: 'MEAT',
  displayOrder: 1,
  id: 'category-meat',
  name: 'Carnes',
};

const summary = {
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

const detail = {
  ...summary,
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
};

describe('HttpFoodCatalogGateway', () => {
  it('searches foods with filters and pagination', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify({
            items: [summary],
            pagination: { limit: 12, page: 2, total: 25 },
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        );
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
      getAccessToken: () => 'test-token',
    });

    await expect(
      new HttpFoodCatalogGateway(apiClient).search({
        categoryId: 'category-meat',
        limit: 12,
        page: 2,
        preparationState: 'COOKED',
        query: 'pollo',
      }),
    ).resolves.toMatchObject({
      items: [{ id: 'food-chicken-cooked', name: 'Pollo cocido' }],
      pagination: { limit: 12, page: 2, total: 25 },
    });

    const url = new URL(request?.url ?? 'http://localhost:3000');
    expect(url.pathname).toBe('/api/foods');
    expect(url.searchParams.get('query')).toBe('pollo');
    expect(url.searchParams.get('categoryId')).toBe('category-meat');
    expect(url.searchParams.get('preparationState')).toBe('COOKED');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('limit')).toBe('12');
    expect(request?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('maps food detail nutrients, servings, source and confidence', async () => {
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        const request = new Request(input, init);
        expect(request.url).toBe(
          'http://localhost:3000/api/foods/food-chicken-cooked',
        );
        return new Response(JSON.stringify(detail), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpFoodCatalogGateway(apiClient).getById('food-chicken-cooked'),
    ).resolves.toMatchObject({
      confidenceLevel: 'VERIFIED',
      nutrients: [{ amount: 165 }],
      servings: [{ equivalentGrams: 150 }],
      source: 'USDA',
    });
  });

  it('lists active food categories', async () => {
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify([category]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpFoodCatalogGateway(apiClient).listCategories(),
    ).resolves.toEqual([category]);
  });

  it('lists nutrients and sends custom food mutations through the API client', async () => {
    const requests: Request[] = [];
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);

        if (request.method === 'DELETE') {
          return new Response(null, { status: 204 });
        }

        if (request.url.endsWith('/api/nutrients')) {
          return new Response(
            JSON.stringify([
              {
                code: 'ENERGY_KCAL',
                displayOrder: 1,
                group: 'ENERGY',
                id: 'nutrient-energy',
                isRequired: true,
                name: 'Energia',
                unit: 'kcal',
              },
            ]),
            { headers: { 'Content-Type': 'application/json' }, status: 200 },
          );
        }

        return new Response(JSON.stringify(detail), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
      getAccessToken: () => 'test-token',
    });
    const gateway = new HttpFoodCatalogGateway(apiClient);

    await expect(gateway.listNutrients()).resolves.toMatchObject([
      { code: 'ENERGY_KCAL', isRequired: true },
    ]);
    await expect(
      gateway.createCustomFood('household-1', {
        brand: null,
        categoryId: 'category-meat',
        confidenceLevel: 'USER_PROVIDED',
        name: 'Pollo casero',
        nutrients: [{ amount: 165, nutrientDefinitionId: 'nutrient-energy' }],
        preparationState: 'COOKED',
        referenceQuantity: 100,
        referenceUnit: 'GRAM',
        servings: [
          {
            equivalentGrams: 150,
            equivalentMilliliters: null,
            name: '1 porcion',
            quantity: 1,
            unit: 'unidad',
          },
        ],
        source: 'Envase',
      }),
    ).resolves.toMatchObject({ id: 'food-chicken-cooked' });
    await expect(
      gateway.updateCustomFood('food-chicken-cooked', {
        nutrients: [{ amount: 170, nutrientDefinitionId: 'nutrient-energy' }],
      }),
    ).resolves.toMatchObject({ id: 'food-chicken-cooked' });
    await expect(gateway.deleteCustomFood('food-chicken-cooked')).resolves.toBeUndefined();

    expect(requests.map((request) => `${request.method} ${new URL(request.url).pathname}`)).toEqual([
      'GET /api/nutrients',
      'POST /api/households/household-1/foods',
      'PATCH /api/foods/food-chicken-cooked',
      'DELETE /api/foods/food-chicken-cooked',
    ]);
    expect(await requests[1]?.clone().json()).toMatchObject({
      nutrients: [{ amount: 165, nutrientDefinitionId: 'nutrient-energy' }],
      servings: [{ equivalentGrams: 150, equivalentMilliliters: null }],
    });
  });
});
