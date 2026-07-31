import { describe, expect, it } from 'vitest';

import { calculateNutritionPreview, roundNutritionSummary } from '@nutrihogar/nutrition-engine';

describe('calculateNutritionPreview', () => {
  it('scales nutrients by grams and treats missing nutrients as zero', () => {
    const result = calculateNutritionPreview([
      {
        nutrition: { calories: 100, proteinGrams: 10 },
        quantity: 50,
        referenceQuantity: 100,
        referenceUnit: 'GRAM',
        unit: 'GRAM',
      },
    ]);

    expect(roundNutritionSummary(result)).toEqual({
      calories: 50,
      proteinGrams: 5,
      carbohydrateGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
    });
  });

  it('uses the serving equivalence for portion-based selections', () => {
    const result = calculateNutritionPreview([
      {
        nutrition: { calories: 250 },
        quantity: 2,
        referenceQuantity: 100,
        referenceUnit: 'GRAM',
        servingEquivalent: 80,
        unit: 'SERVING',
      },
    ]);

    expect(result.calories).toBe(400);
  });
});
