import type {
  MealDetails,
  MealItemSnapshot,
  MealNutrientSnapshot,
  MealPreparationReference,
  RegisteredMeal,
} from '../../application/ports/MealGateway';

export function toRegisteredMeal(value: unknown): RegisteredMeal {
  const source = asRecord(value);
  return {
    consumedAt: String(source.consumedAt ?? ''),
    id: String(source.id ?? ''),
    mealType: String(source.mealType ?? ''),
    totals: toNutrientTotals(source.totals),
  };
}

export function toMealDetails(value: unknown): MealDetails {
  const source = asRecord(value);
  return {
    ...toRegisteredMeal(source),
    adultProfileId: toNullableString(source.adultProfileId),
    householdId: toNullableString(source.householdId),
    items: Array.isArray(source.items) ? source.items.map(toMealItemSnapshot) : [],
    notes: source.notes == null ? null : String(source.notes),
    preparation: toPreparationReference(source),
    source: String(source.source ?? 'MANUAL'),
    status: String(source.status ?? 'CONFIRMED'),
  };
}

function toPreparationReference(source: Record<string, unknown>): MealPreparationReference | null {
  if (source.source === 'MANUAL' && source.sourceReference == null && source.preparation == null) return null;
  const reference = asRecord(source.sourceReference ?? source.preparation);
  if (Object.keys(reference).length === 0 && source.source === 'MANUAL') return null;
  return {
    consumedWeight: numberOrNull(reference.consumedWeight),
    portionId: toNullableString(reference.portionId),
    preparedBatchId: toNullableString(reference.preparedBatchId ?? reference.batchId),
    recipeName: toNullableString(reference.recipeName ?? reference.recipeNameSnapshot),
    servedWeight: numberOrNull(reference.servedWeight),
  };
}

function toMealItemSnapshot(value: unknown): MealItemSnapshot {
  const source = asRecord(value);
  const nutrients = Array.isArray(source.nutrients)
    ? source.nutrients.map(toNutrientSnapshot)
    : [];

  return {
    baseQuantity: Number(source.baseQuantity ?? source.quantity ?? 0),
    baseUnit: String(source.baseUnit ?? source.unit ?? ''),
    brand: toNullableString(source.brandSnapshot ?? source.brand),
    confidenceLevel: toNullableString(source.confidenceLevel),
    foodId: toNullableString(source.foodId),
    foodName: String(source.nameSnapshot ?? source.foodName ?? 'Alimento'),
    foodServingId: toNullableString(source.foodServingId),
    id: String(source.id ?? crypto.randomUUID()),
    measurementMethod: String(source.measurementMethod ?? 'APPROXIMATED'),
    nutrients,
    preparationState: toNullableString(source.preparationStateSnapshot),
    quantity: Number(source.quantity ?? 0),
    totals: nutrientSnapshotsToTotals(nutrients),
    unit: String(source.unit ?? ''),
  };
}

function toNutrientSnapshot(value: unknown): MealNutrientSnapshot {
  const source = asRecord(value);
  return {
    amount: Number(source.amount ?? 0),
    code: String(source.code ?? ''),
    name: String(source.name ?? source.code ?? 'Nutriente'),
    unit: String(source.unit ?? ''),
  };
}

export function toNutrientTotals(value: unknown): Record<string, number> {
  if (Array.isArray(value)) return nutrientSnapshotsToTotals(value.map(toNutrientSnapshot));
  const source = asRecord(value);
  return {
    calories: numberFrom(source, ['calories', 'dailyCalories', 'ENERGY_KCAL', 'CALORIES']),
    carbohydrateGrams: numberFrom(source, ['carbohydrateGrams', 'CARBOHYDRATE', 'CARBS']),
    fatGrams: numberFrom(source, ['fatGrams', 'FAT']),
    fiberGrams: numberFrom(source, ['fiberGrams', 'FIBER']),
    proteinGrams: numberFrom(source, ['proteinGrams', 'PROTEIN']),
  };
}

function nutrientSnapshotsToTotals(nutrients: MealNutrientSnapshot[]) {
  return toNutrientTotals(Object.fromEntries(nutrients.map((nutrient) => [nutrient.code, nutrient.amount])));
}

function numberFrom(source: Record<string, unknown>, keys: string[]) {
  const key = keys.find((candidate) => source[candidate] !== undefined);
  return key ? Number(source[key]) : 0;
}

function toNullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' ? value : value == null ? null : Number(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
