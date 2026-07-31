import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';
import { HttpDailyNutritionSummaryGateway } from './HttpDailyNutritionSummaryGateway';

describe('HttpDailyNutritionSummaryGateway', () => {
  it('requests a profile summary for the selected date and maps calories', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async (input, init) => {
      request = new Request(input, init);
      return new Response(JSON.stringify({
        consumed: { dailyCalories: 1450, proteinGrams: 110 },
        date: '2026-07-29',
        goal: { dailyCalories: 2200, proteinGrams: 170 },
        meals: [],
        profileId: 'profile-1',
        profileName: 'Alejandro',
        remaining: { dailyCalories: 750, proteinGrams: 60 },
      }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
    });
    const apiClient = createApiClient({ baseUrl: 'http://localhost:3000', fetch: fetchImplementation });

    const summary = await new HttpDailyNutritionSummaryGateway(apiClient).getByProfileAndDate('profile-1', '2026-07-29');

    expect(new URL(request?.url ?? '').pathname).toBe('/api/adult-profiles/profile-1/daily-nutrition-summary');
    expect(new URL(request?.url ?? '').search).toBe('?date=2026-07-29');
    expect(summary.consumed.calories).toBe(1450);
    expect(summary.goal?.calories).toBe(2200);
  });
});
