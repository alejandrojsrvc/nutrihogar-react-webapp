import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../../../test/renderRoute';

const profile = (id: string, name: string) => ({
  activityLevel: 'MODERATE', age: 32, biologicalSex: 'MALE', birthDate: '1994-01-01',
  dietaryRestrictions: [], hasKitchenScale: true, heightCm: 175, householdId: 'household-1',
  id, isActive: true, name, primaryGoal: 'MAINTENANCE', updatedAt: '2026-07-01',
  userId: 'user-1', weightKg: 75, createdAt: '2026-07-01',
});

describe('DailyNutritionSummaryPage', () => {
  it('changes adult and renders the empty day state', async () => {
    const user = userEvent.setup();
    const requests: Request[] = [];
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith('/api/households')) return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar', timezone: 'UTC' }]);
      if (request.url.includes('daily-nutrition-summary')) return jsonResponse({
        consumed: { dailyCalories: 0, proteinGrams: 0, carbohydrateGrams: 0, fatGrams: 0, fiberGrams: 0 },
        date: '2026-07-29', goal: null, meals: [], profileId: 'profile-2', profileName: 'Sofia',
        remaining: { dailyCalories: 0, proteinGrams: 0, carbohydrateGrams: 0, fatGrams: 0, fiberGrams: 0 },
      });
      if (request.url.includes('/adult-profiles')) return jsonResponse([profile('profile-1', 'Alejandro'), profile('profile-2', 'Sofia')]);
      return jsonResponse({ status: 'ok' });
    });

    renderRoute('/app/resumen/2026-07-29', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));

    expect(await screen.findByRole('heading', { name: 'Resumen del día' })).toBeInTheDocument();
    expect(await screen.findByText('Este día no tiene meta')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Adulto'), 'profile-2');
    await waitFor(() => expect(requests.some((request) => request.url.includes('/profile-2/daily-nutrition-summary'))).toBe(true));
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status: 200 });
}
