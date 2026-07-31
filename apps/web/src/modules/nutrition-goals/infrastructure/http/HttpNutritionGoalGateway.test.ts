import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpNutritionGoalGateway } from './HttpNutritionGoalGateway';

describe('HttpNutritionGoalGateway', () => {
  it('interpolates the profile id when loading the current goal', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async (input, init) => {
      request = new Request(input, init);
      return new Response(null, { status: 200 });
    });
    const apiClient = createApiClient({ baseUrl: 'http://localhost:3000', fetch: fetchImplementation });

    await expect(
      new HttpNutritionGoalGateway(apiClient).getCurrent('profile-123'),
    ).resolves.toBeNull();

    expect(new URL(request?.url ?? '').pathname).toBe(
      '/api/adult-profiles/profile-123/nutrition-goals/current',
    );
  });

  it('interpolates profile and suggestion ids for mutations', async () => {
    const requests: Request[] = [];
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return new Response(
        JSON.stringify(
          request.url.includes('confirm')
            ? {
                adultProfileId: 'profile-123',
                dailyCalories: 2000,
                proteinGrams: 150,
                carbohydrateGrams: 200,
                fatGrams: 70,
                fiberGrams: 30,
                id: 'goal-1',
                validFrom: '2026-07-31',
              }
            : {
                calculation: { bmr: 1500, activityFactor: 1.4, tdee: 2100 },
                id: 'suggestion-1',
                status: 'PENDING',
                suggestion: {
                  dailyCalories: 2000,
                  proteinGrams: 150,
                  carbohydrateGrams: 200,
                  fatGrams: 70,
                  fiberGrams: 30,
                },
              },
        ),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    });
    const apiClient = createApiClient({ baseUrl: 'http://localhost:3000', fetch: fetchImplementation });
    const gateway = new HttpNutritionGoalGateway(apiClient);

    await gateway.generateSuggestion('profile-123');
    await gateway.confirmSuggestion('suggestion-1', { dailyCalories: 2000 });

    expect(new URL(requests[0].url).pathname).toBe(
      '/api/adult-profiles/profile-123/nutrition-goal-suggestions',
    );
    expect(new URL(requests[1].url).pathname).toBe(
      '/api/nutrition-goal-suggestions/suggestion-1/confirm',
    );
  });
});
