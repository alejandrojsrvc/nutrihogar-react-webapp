export const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;
export type MealType = (typeof mealTypes)[number];
export const mealSources = ['RECIPE', 'PREVIOUS_MEAL', 'FREE_MEAL', 'RESTAURANT', 'DELIVERY'] as const;
export type MealSource = (typeof mealSources)[number];
export type MealStatus = 'PLANNED' | 'PREPARED' | 'SERVED' | 'CONSUMED' | 'SKIPPED' | 'REPLACED' | 'CANCELLED';

export interface PlannedMealParticipant {
  id: string;
  adultProfileId: string;
  suggestedQuantity?: number | null;
  suggestedUnit?: string | null;
  confirmedQuantity?: number | null;
  confirmedUnit?: string | null;
}
export interface PlannedMeal {
  id: string; date: string; type: MealType | 'EXTRA'; source: MealSource | 'UNPLANNED' | 'EMPTY';
  recipeId: string | null; name: string | null; notes: string | null; status: MealStatus;
   participants: PlannedMealParticipant[]; position: number; previousMealId?: string | null; preparedBatchId?: string | null; mealId?: string | null;
}
export interface WeeklyPlan {
  id: string; householdId: string; weekStart: string; weekEnd: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'; meals: PlannedMeal[];
}
export interface QuantitySuggestion { participantId: string; adultProfileId: string; quantity: number; unit: string; goalValidFrom: string; targetCalories: number; }
export interface WeeklyRequirement { foodId: string; name: string; unit: string; required: number; }
export interface WeeklyRequirements { items: WeeklyRequirement[]; warnings: string[]; }
export type InventoryStatus = 'COMPLETE' | 'PARTIAL' | 'MISSING' | 'NOT_NEEDED';
export interface InventoryComparisonItem extends WeeklyRequirement { available: number; missing: number; coverage: number; status: InventoryStatus; }
export interface InventoryComparison { items: InventoryComparisonItem[]; warnings: string[]; }
export interface AdherenceSummary { weeklyPlanId: string; weekStart: string; counts: { planned: number; consumed: number; skipped: number; cancelled: number; replaced: number; unplanned: number }; percentages: { consumed: number; unplanned: number }; nutrition: { plannedCalories: number; consumedCalories: number; plannedProtein: number; consumedProtein: number; caloriePercentage: number; proteinPercentage: number }; warnings: string[]; }
