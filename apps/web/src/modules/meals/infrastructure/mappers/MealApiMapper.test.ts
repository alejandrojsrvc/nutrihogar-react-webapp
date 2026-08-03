import { describe, expect, it } from 'vitest';
import { toMealDetails } from './MealApiMapper';

describe('MealApiMapper', () => {
  it('preserves confirmed meal and item snapshots', () => {
    const meal = toMealDetails({
      adultProfileId: 'profile-1',
      consumedAt: '2026-07-31T12:00:00.000Z',
      householdId: 'household-1',
      id: 'meal-1',
      items: [
        {
          baseQuantity: 100,
          baseUnit: 'GRAM',
          foodId: 'food-1',
          id: 'item-1',
          measurementMethod: 'WEIGHED',
          nameSnapshot: 'Arroz',
          nutrients: [
            { amount: 130, code: 'ENERGY_KCAL', name: 'Energía', unit: 'kcal' },
          ],
          quantity: 100,
          unit: 'GRAM',
        },
      ],
      mealType: 'LUNCH',
      source: 'MANUAL',
      status: 'CONFIRMED',
      totals: { ENERGY_KCAL: 130 },
    });

    expect(meal.adultProfileId).toBe('profile-1');
    expect(meal.items[0]?.measurementMethod).toBe('WEIGHED');
    expect(meal.items[0]?.nutrients[0]?.amount).toBe(130);
    expect(meal.items[0]?.totals.calories).toBe(130);
  });

  it('maps preparation origin without changing manual meals', () => {
    const meal = toMealDetails({
      id: 'meal-2',
      source: 'PREPARED_BATCH',
      sourceReference: {
        consumedWeight: 180,
        portionId: 'portion-1',
        preparedBatchId: 'batch-1',
        recipeName: 'Arroz familiar',
        servedWeight: 220,
      },
    });

    expect(meal.preparation).toEqual({
      consumedWeight: 180,
      portionId: 'portion-1',
      preparedBatchId: 'batch-1',
      recipeName: 'Arroz familiar',
      servedWeight: 220,
    });
    expect(
      toMealDetails({ id: 'meal-3', source: 'MANUAL' }).preparation,
    ).toBeNull();
  });
});
