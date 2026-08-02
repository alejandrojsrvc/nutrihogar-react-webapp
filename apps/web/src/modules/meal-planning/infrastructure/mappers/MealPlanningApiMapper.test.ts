import { describe, expect, it } from 'vitest';
import { toAdherenceSummary, toInventoryComparison, toPlannedMealRequest, toQuantitySuggestion, toWeeklyPlan, toWeeklyRequirements } from './MealPlanningApiMapper';

describe('MealPlanningApiMapper', () => {
  it('maps API snapshots and keeps participant and position data', () => {
    const plan = toWeeklyPlan({ id: 'plan', householdId: 'home', weekStart: '2026-08-03', weekEnd: '2026-08-09', status: 'DRAFT', meals: [{ id: 'meal', date: '2026-08-03', type: 'BREAKFAST', source: 'RECIPE', recipeId: 'recipe', nameSnapshot: 'Avena', status: 'PLANNED', participants: [{ id: 'participant', adultProfileId: 'adult' }], position: 2 }] });
    expect(plan.meals[0]).toMatchObject({ id: 'meal', name: 'Avena', recipeId: 'recipe', position: 2 });
    expect(plan.meals[0].participants).toHaveLength(1);
  });

  it('maps previous meal data without leaking presentation fields', () => {
    expect(toPlannedMealRequest({ date: '2026-08-03', nameSnapshot: 'Sopa', notes: null, position: 0, previousMealId: 'meal-1', recipeId: null, source: 'PREVIOUS_MEAL', type: 'DINNER' })).toEqual({ date: '2026-08-03', nameSnapshot: 'Sopa', notes: null, position: 0, previousMealId: 'meal-1', recipeId: null, source: 'PREVIOUS_MEAL', type: 'DINNER' });
  });

  it('maps decimal nutrition responses to numbers without changing units', () => {
    expect(toQuantitySuggestion({ adultProfileId: 'adult', goalValidFrom: '2026-08-01T00:00:00Z', participantId: 'participant', quantity: '1.25', targetCalories: '650.000', unit: 'SERVING' })).toMatchObject({ quantity: 1.25, targetCalories: 650, unit: 'SERVING' });
    expect(toWeeklyRequirements({ items: [{ foodId: 'food', name: 'Arroz', required: '1200.000', unit: 'GRAM' }], warnings: ['Sin inventario'] }).items[0].required).toBe(1200);
    expect(toInventoryComparison({ items: [{ available: '900', coverage: '0.75', foodId: 'food', missing: '300', name: 'Arroz', required: '1200', status: 'PARTIAL', unit: 'GRAM' }], warnings: [] }).items[0]).toMatchObject({ available: 900, coverage: 0.75, missing: 300, required: 1200, status: 'PARTIAL' });
  });

  it('maps backend adherence values without calculating nutrition locally', () => {
    const summary = toAdherenceSummary({ counts: { cancelled: 0, consumed: 2, planned: 3, replaced: 0, skipped: 1, unplanned: 0 }, nutrition: { caloriePercentage: '80', consumedCalories: '1600', consumedProtein: '70', plannedCalories: '2000', plannedProtein: '90', proteinPercentage: '77.77' }, percentages: { consumed: '66.67', unplanned: '0' }, warnings: [], weekStart: '2026-08-03', weeklyPlanId: 'plan-1' });
    expect(summary).toMatchObject({ nutrition: { caloriePercentage: 80, plannedCalories: 2000 }, percentages: { consumed: 66.67 }, weeklyPlanId: 'plan-1' });
  });
});
