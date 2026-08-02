import type { MealSource, MealType, WeeklyPlan } from '../../domain/MealPlanning';

export interface PlannedMealInput { date: string; type: MealType; source: MealSource; recipeId?: string | null; previousMealId?: string | null; nameSnapshot?: string | null; notes?: string | null; position: number; }
export interface MealPlanListCriteria { weekStart?: string; page: number; limit: number; }
export interface MealPlanningGateway {
  list(householdId: string, criteria: MealPlanListCriteria): Promise<{ items: WeeklyPlan[]; page: number; limit: number; total: number }>;
  get(weeklyPlanId: string): Promise<WeeklyPlan>;
  create(householdId: string, weekStart: string): Promise<WeeklyPlan>;
  addMeal(weeklyPlanId: string, input: PlannedMealInput): Promise<WeeklyPlan>;
  updateMeal(plannedMealId: string, input: Partial<PlannedMealInput>): Promise<WeeklyPlan>;
}
