import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpMealGateway } from './HttpMealGateway';

describe('HttpMealGateway', () => {
  it('interpolates the household id when registering a meal', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify({
            id: 'meal-1',
            mealType: 'LUNCH',
            consumedAt: '2026-07-31T12:00:00.000Z',
            totals: {},
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 201 },
        );
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await new HttpMealGateway(apiClient).register({
      consumedAt: new Date('2026-07-31T12:00:00.000Z'),
      householdId: 'household-123',
      items: [
        {
          foodId: 'food-1',
          measurementMethod: 'WEIGHED',
          quantity: 100,
          unit: 'GRAM',
        },
      ],
      mealType: 'LUNCH',
      notes: '',
      profileId: 'profile-123',
    });

    expect(new URL(request?.url ?? '').pathname).toBe(
      '/api/households/household-123/meals',
    );
  });

  it('loads a meal detail by id', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify({
            consumedAt: '2026-07-31T12:00:00.000Z',
            id: 'meal-1',
            adultProfileId: 'profile-1',
            items: [
              {
                foodId: 'food-1',
                id: 'item-1',
                measurementMethod: 'WEIGHED',
                nameSnapshot: 'Arroz',
                nutrients: [
                  {
                    amount: 130,
                    code: 'ENERGY_KCAL',
                    name: 'Energía',
                    unit: 'kcal',
                  },
                ],
                quantity: 100,
                unit: 'GRAM',
              },
            ],
            mealType: 'LUNCH',
            totals: { calories: 300 },
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        );
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    const meal = await new HttpMealGateway(apiClient).getById('meal-1');

    expect(new URL(request?.url ?? '').pathname).toBe('/api/meals/meal-1');
    expect(meal.items[0]?.foodName).toBe('Arroz');
    expect(meal.items[0]?.nutrients[0]?.amount).toBe(130);
    expect(meal.adultProfileId).toBe('profile-1');
  });

  it('updates and cancels a meal through its id', async () => {
    const requests: Request[] = [];
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return new Response(
          request.method === 'PATCH'
            ? JSON.stringify({
                id: 'meal-1',
                consumedAt: '2026-07-31T12:00:00.000Z',
                mealType: 'LUNCH',
                totals: {},
                items: [],
              })
            : null,
          {
            headers: { 'Content-Type': 'application/json' },
            status: request.method === 'PATCH' ? 200 : 204,
          },
        );
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });
    const gateway = new HttpMealGateway(apiClient);

    await gateway.update('meal-1', {
      consumedAt: new Date('2026-07-31T12:00:00.000Z'),
      items: [
        {
          foodId: 'food-1',
          quantity: 100,
          unit: 'GRAM',
          measurementMethod: 'WEIGHED',
          servingId: 'serving-1',
        },
      ],
      mealType: 'LUNCH',
      notes: '',
    });
    await gateway.cancel('meal-1');

    expect(requests.map((request) => request.method)).toEqual([
      'PATCH',
      'DELETE',
    ]);
    expect(await requests[0]?.clone().json()).toMatchObject({
      items: [{ servingId: 'serving-1' }],
    });
  });

  it('duplicates a meal with a new destination', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify({
            id: 'meal-2',
            consumedAt: '2026-08-01T13:00:00.000Z',
            mealType: 'LUNCH',
            totals: {},
            items: [],
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 201 },
        );
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });
    await new HttpMealGateway(apiClient).duplicate('meal-1', {
      adultProfileId: 'profile-1',
      consumedAt: new Date('2026-08-01T13:00:00.000Z'),
      mealType: 'LUNCH',
    });
    expect(new URL(request?.url ?? '').pathname).toBe(
      '/api/meals/meal-1/duplicate',
    );
    expect(await request?.clone().json()).toMatchObject({
      adultProfileId: 'profile-1',
      mealType: 'LUNCH',
    });
  });
});
