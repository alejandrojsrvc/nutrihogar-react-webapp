import { describe, expect, it, vi } from 'vitest';
import { HttpMealPlanningGateway } from './HttpMealPlanningGateway';

describe('HttpMealPlanningGateway meal-planning endpoints', () => {
  it('maps participant assignment and requirements paths', async () => {
    const client = {
      POST: vi.fn().mockResolvedValue({ data: planResponse() }),
      GET: vi.fn().mockResolvedValue({
        data: {
          items: [
            { foodId: 'food', name: 'Arroz', unit: 'GRAM', required: '1200' },
          ],
          warnings: [],
        },
      }),
    };
    const gateway = new HttpMealPlanningGateway(client as never);
    await gateway.assignParticipant('meal-1', 'adult-1');
    await gateway.getRequirements('plan-1');
    expect(client.POST).toHaveBeenCalledWith(
      '/api/planned-meals/meal-1/participants',
      {
        body: { adultProfileId: 'adult-1' },
        params: { path: { plannedMealId: 'meal-1' } },
      },
    );
    expect(client.GET).toHaveBeenCalledWith(
      '/api/weekly-plans/plan-1/requirements',
      { params: { path: { weeklyPlanId: 'plan-1' } } },
    );
  });

  it('accepts a 204 participant deletion without requiring a response body', async () => {
    const client = {
      DELETE: vi
        .fn()
        .mockResolvedValue({ response: new Response(null, { status: 204 }) }),
    };
    await new HttpMealPlanningGateway(client as never).deleteParticipant(
      'participant-1',
    );
    expect(client.DELETE).toHaveBeenCalledWith(
      '/api/planned-meal-participants/participant-1',
      { params: { path: { participantId: 'participant-1' } } },
    );
  });
});

function planResponse() {
  return {
    id: 'plan-1',
    householdId: 'home-1',
    weekStart: '2026-08-03',
    weekEnd: '2026-08-09',
    status: 'DRAFT',
    meals: [],
  };
}
