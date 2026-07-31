import type {
  MeasurementUnit,
  NutritionSummary,
} from '@nutrihogar/domain';

export interface PreviewFoodItem {
  quantity: number;
  unit: MeasurementUnit;
  referenceQuantity: number;
  referenceUnit: Exclude<MeasurementUnit, 'SERVING'>;
  servingEquivalent?: number | null;
  nutrition: Partial<NutritionSummary>;
}

export function calculateNutritionPreview(
  items: PreviewFoodItem[],
): NutritionSummary {
  return items.reduce<NutritionSummary>(
    (total, item) => {
      const multiplier = getReferenceMultiplier(item);

      return {
        calories: total.calories + (item.nutrition.calories ?? 0) * multiplier,
        proteinGrams:
          total.proteinGrams + (item.nutrition.proteinGrams ?? 0) * multiplier,
        carbohydrateGrams:
          total.carbohydrateGrams +
          (item.nutrition.carbohydrateGrams ?? 0) * multiplier,
        fatGrams: total.fatGrams + (item.nutrition.fatGrams ?? 0) * multiplier,
        fiberGrams:
          total.fiberGrams + (item.nutrition.fiberGrams ?? 0) * multiplier,
      };
    },
    emptyNutritionSummary(),
  );
}

export function roundNutritionSummary(
  summary: NutritionSummary,
  decimals = 1,
): NutritionSummary {
  const factor = 10 ** decimals;
  return Object.fromEntries(
    Object.entries(summary).map(([key, value]) => [
      key,
      Math.round(value * factor) / factor,
    ]),
  ) as NutritionSummary;
}

function getReferenceMultiplier(item: PreviewFoodItem): number {
  if (item.referenceQuantity <= 0) return 0;

  const referenceAmount =
    item.unit === 'SERVING'
      ? (item.servingEquivalent ?? 0) * item.quantity
      : item.quantity;

  return referenceAmount / item.referenceQuantity;
}

function emptyNutritionSummary(): NutritionSummary {
  return {
    calories: 0,
    proteinGrams: 0,
    carbohydrateGrams: 0,
    fatGrams: 0,
    fiberGrams: 0,
  };
}
