import type { components } from '@nutrihogar/api-client';
import type { PlannedMeal, WeeklyPlan } from '../../domain/MealPlanning';
import type { PlannedMealInput } from '../../application/ports/MealPlanningGateway';

export function toPlannedMeal(value: unknown): PlannedMeal {
  const item = value as components['schemas']['PlannedMealResponseDto'] & { previousMealId?: string | null };
  return { id: item.id, date: item.date, type: item.type, source: item.source, recipeId: item.recipeId ?? null, name: item.nameSnapshot ?? null, notes: item.notes ?? null, status: item.status, participants: Array.isArray(item.participants) ? item.participants.map((participant) => ({ adultProfileId: participant.adultProfileId, id: participant.id })) : [], position: Number(item.position ?? 0), previousMealId: item.previousMealId ?? null };
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
  return { id: item.id, householdId: item.householdId, weekStart: item.weekStart, weekEnd: item.weekEnd, status: item.status, meals: Array.isArray(item.meals) ? item.meals.map(toPlannedMeal) : [] };
}
