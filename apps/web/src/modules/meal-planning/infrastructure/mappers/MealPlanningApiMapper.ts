import type { components } from '@nutrihogar/api-client';
import type {
  AdherenceSummary,
  InventoryComparison,
  PlannedMeal,
  QuantitySuggestion,
  WeeklyPlan,
  WeeklyRequirements,
} from '../../domain/MealPlanning';
import type { PlannedMealInput } from '../../application/ports/MealPlanningGateway';

export function toPlannedMeal(value: unknown): PlannedMeal {
  const item = value as components['schemas']['PlannedMealResponseDto'] & {
    previousMealId?: string | null;
  };
  return {
    id: item.id,
    date: item.date,
    type: item.type,
    source: item.source,
    recipeId: item.recipeId ?? null,
    name: item.nameSnapshot ?? null,
    notes: item.notes ?? null,
    status: item.status,
    participants: Array.isArray(item.participants)
      ? item.participants.map((participant) => ({
          adultProfileId: participant.adultProfileId,
          id: participant.id,
          suggestedQuantity:
            participant.suggestedQuantity == null
              ? null
              : Number(participant.suggestedQuantity),
          suggestedUnit: participant.suggestedUnit ?? null,
          confirmedQuantity:
            participant.confirmedQuantity == null
              ? null
              : Number(participant.confirmedQuantity),
          confirmedUnit: participant.confirmedUnit ?? null,
        }))
      : [],
    position: Number(item.position ?? 0),
    previousMealId: item.previousMealId ?? null,
    preparedBatchId: item.preparedBatchId ?? null,
    mealId: item.mealId ?? null,
  };
}

export function toPlannedMealRequest(input: PlannedMealInput) {
  return {
    date: input.date,
    type: input.type,
    source: input.source,
    recipeId: input.recipeId ?? null,
    previousMealId: input.previousMealId ?? null,
    nameSnapshot: input.nameSnapshot ?? null,
    notes: input.notes ?? null,
    position: input.position,
  };
}

export function toUpdatePlannedMealRequest(input: Partial<PlannedMealInput>) {
  return {
    ...input,
    recipeId: input.recipeId ?? null,
    previousMealId: input.previousMealId ?? null,
    nameSnapshot: input.nameSnapshot ?? null,
    notes: input.notes ?? null,
  };
}
export function toWeeklyPlan(value: unknown): WeeklyPlan {
  const item = value as components['schemas']['WeeklyPlanResponseDto'];
  return {
    id: item.id,
    householdId: item.householdId,
    weekStart: item.weekStart,
    weekEnd: item.weekEnd,
    status: item.status,
    meals: Array.isArray(item.meals) ? item.meals.map(toPlannedMeal) : [],
  };
}
export function toQuantitySuggestion(value: unknown): QuantitySuggestion {
  const item = value as {
    participantId: string;
    adultProfileId: string;
    quantity: string;
    unit: string;
    goalValidFrom: string;
    targetCalories: string;
  };
  return {
    participantId: item.participantId,
    adultProfileId: item.adultProfileId,
    quantity: Number(item.quantity),
    unit: item.unit,
    goalValidFrom: item.goalValidFrom,
    targetCalories: Number(item.targetCalories),
  };
}
export function toWeeklyRequirements(value: unknown): WeeklyRequirements {
  const item = value as {
    items?: Array<{
      foodId: string;
      name: string;
      unit: string;
      required: string;
    }>;
    warnings?: string[];
  };
  return {
    items: Array.isArray(item.items)
      ? item.items.map((entry) => ({
          ...entry,
          required: Number(entry.required),
        }))
      : [],
    warnings: item.warnings ?? [],
  };
}
export function toInventoryComparison(value: unknown): InventoryComparison {
  const item = value as {
    items?: Array<{
      foodId: string;
      name: string;
      unit: string;
      required: string;
      available: string;
      missing: string;
      coverage: string;
      status: 'COMPLETE' | 'PARTIAL' | 'MISSING' | 'NOT_NEEDED';
    }>;
    warnings?: string[];
  };
  return {
    items: Array.isArray(item.items)
      ? item.items.map((entry) => ({
          ...entry,
          required: Number(entry.required),
          available: Number(entry.available),
          missing: Number(entry.missing),
          coverage: Number(entry.coverage),
        }))
      : [],
    warnings: item.warnings ?? [],
  };
}
export function toAdherenceSummary(value: unknown): AdherenceSummary {
  const item = value as components['schemas']['AdherenceResponseDto'];
  return {
    weeklyPlanId: item.weeklyPlanId,
    weekStart: item.weekStart,
    counts: item.counts,
    percentages: {
      consumed: Number(item.percentages.consumed),
      unplanned: Number(item.percentages.unplanned),
    },
    nutrition: {
      plannedCalories: Number(item.nutrition.plannedCalories),
      consumedCalories: Number(item.nutrition.consumedCalories),
      plannedProtein: Number(item.nutrition.plannedProtein),
      consumedProtein: Number(item.nutrition.consumedProtein),
      caloriePercentage: Number(item.nutrition.caloriePercentage),
      proteinPercentage: Number(item.nutrition.proteinPercentage),
    },
    warnings: item.warnings ?? [],
  };
}
