export const MEAL_TYPES = [
  'BREAKFAST',
  'LUNCH',
  'SNACK',
  'DINNER',
  'EXTRA',
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEASUREMENT_UNITS = [
  'GRAM',
  'MILLILITER',
  'UNIT',
  'SERVING',
] as const;

export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];

export const MEASUREMENT_METHODS = [
  'WEIGHED',
  'SERVING',
  'UNIT',
  'APPROXIMATED',
] as const;

export type MeasurementMethod = (typeof MEASUREMENT_METHODS)[number];

export interface NutritionSummary {
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export const NUTRIENT_ORDER = [
  'calories',
  'proteinGrams',
  'carbohydrateGrams',
  'fatGrams',
  'fiberGrams',
] as const satisfies readonly (keyof NutritionSummary)[];

export const NUTRIENT_LABELS: Record<keyof NutritionSummary, string> = {
  calories: 'Calorías',
  proteinGrams: 'Proteína',
  carbohydrateGrams: 'Carbohidratos',
  fatGrams: 'Grasas',
  fiberGrams: 'Fibra',
};

export function formatNutritionValue(value: number, unit = ''): string {
  const rounded = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 1,
  }).format(value);

  return unit ? `${rounded} ${unit}` : rounded;
}

export function formatGrams(value: number): string {
  return formatNutritionValue(value, 'g');
}

export function formatCalories(value: number): string {
  return formatNutritionValue(value, 'kcal');
}

export function formatPortion(value: number): string {
  return `${formatNutritionValue(value)} ${value === 1 ? 'porción' : 'porciones'}`;
}
