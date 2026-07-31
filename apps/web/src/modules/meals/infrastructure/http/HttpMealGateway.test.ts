import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpMealGateway } from './HttpMealGateway';

describe('HttpMealGateway', () => {
  it('interpolates the household id when registering a meal', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async (input, init) => {
      request = new Request(input, init);
      return new Response(
        JSON.stringify({ id: 'meal-1', mealType: 'LUNCH', consumedAt: '2026-07-31T12:00:00.000Z', totals: {} }),
        { headers: { 'Content-Type': 'application/json' }, status: 201 },
      );
    });
    const apiClient = createApiClient({ baseUrl: 'http://localhost:3000', fetch: fetchImplementation });

    await new HttpMealGateway(apiClient).register({
      consumedAt: new Date('2026-07-31T12:00:00.000Z'),
      householdId: 'household-123',
      items: [{ foodId: 'food-1', measurementMethod: 'WEIGHED', quantity: 100, unit: 'GRAM' }],
      mealType: 'LUNCH',
      notes: '',
      profileId: 'profile-123',
    });

    expect(new URL(request?.url ?? '').pathname).toBe(
      '/api/households/household-123/meals',
    );
  });
});
