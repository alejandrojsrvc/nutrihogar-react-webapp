export const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;
export type MealType = (typeof mealTypes)[number];
export const mealSources = ['RECIPE', 'PREVIOUS_MEAL', 'FREE_MEAL', 'RESTAURANT', 'DELIVERY'] as const;
export type MealSource = (typeof mealSources)[number];
export type MealStatus = 'PLANNED' | 'PREPARED' | 'SERVED' | 'CONSUMED' | 'SKIPPED' | 'REPLACED' | 'CANCELLED';

export interface PlannedMealParticipant { id: string; adultProfileId: string; }
export interface PlannedMeal {
  id: string; date: string; type: MealType | 'EXTRA'; source: MealSource | 'UNPLANNED' | 'EMPTY';
  recipeId: string | null; name: string | null; notes: string | null; status: MealStatus;
  participants: PlannedMealParticipant[]; position: number; previousMealId?: string | null;
}
export interface WeeklyPlan {
  id: string; householdId: string; weekStart: string; weekEnd: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'; meals: PlannedMeal[];
}
