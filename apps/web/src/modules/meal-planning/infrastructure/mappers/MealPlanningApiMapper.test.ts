import { describe, expect, it } from 'vitest';
import { toPlannedMealRequest, toWeeklyPlan } from './MealPlanningApiMapper';

describe('MealPlanningApiMapper', () => {
  it('maps API snapshots and keeps participant and position data', () => {
    const plan = toWeeklyPlan({ id: 'plan', householdId: 'home', weekStart: '2026-08-03', weekEnd: '2026-08-09', status: 'DRAFT', meals: [{ id: 'meal', date: '2026-08-03', type: 'BREAKFAST', source: 'RECIPE', recipeId: 'recipe', nameSnapshot: 'Avena', status: 'PLANNED', participants: [{ id: 'participant', adultProfileId: 'adult' }], position: 2 }] });
    expect(plan.meals[0]).toMatchObject({ id: 'meal', name: 'Avena', recipeId: 'recipe', position: 2 });
    expect(plan.meals[0].participants).toHaveLength(1);
  });

  it('maps previous meal data without leaking presentation fields', () => {
    expect(toPlannedMealRequest({ date: '2026-08-03', nameSnapshot: 'Sopa', notes: null, position: 0, previousMealId: 'meal-1', recipeId: null, source: 'PREVIOUS_MEAL', type: 'DINNER' })).toEqual({ date: '2026-08-03', nameSnapshot: 'Sopa', notes: null, position: 0, previousMealId: 'meal-1', recipeId: null, source: 'PREVIOUS_MEAL', type: 'DINNER' });
  });
});
