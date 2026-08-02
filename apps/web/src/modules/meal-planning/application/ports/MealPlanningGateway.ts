import type { AdherenceSummary, InventoryComparison, MealSource, MealType, QuantitySuggestion, WeeklyPlan, WeeklyRequirements } from '../../domain/MealPlanning';

export interface PlannedMealInput { date: string; type: MealType; source: MealSource; recipeId?: string | null; previousMealId?: string | null; nameSnapshot?: string | null; notes?: string | null; position: number; }
export interface MealPlanListCriteria { weekStart?: string; page: number; limit: number; }
export interface MealPlanningGateway {
  list(householdId: string, criteria: MealPlanListCriteria): Promise<{ items: WeeklyPlan[]; page: number; limit: number; total: number }>;
  get(weeklyPlanId: string): Promise<WeeklyPlan>;
  create(householdId: string, weekStart: string): Promise<WeeklyPlan>;
  addMeal(weeklyPlanId: string, input: PlannedMealInput): Promise<WeeklyPlan>;
  updateMeal(plannedMealId: string, input: Partial<PlannedMealInput>): Promise<WeeklyPlan>;
  assignParticipant(plannedMealId: string, adultProfileId: string): Promise<WeeklyPlan>;
  deleteParticipant(participantId: string): Promise<void>;
  proposeQuantities(plannedMealId: string): Promise<QuantitySuggestion[]>;
  listQuantities(plannedMealId: string): Promise<QuantitySuggestion[]>;
  acceptQuantitySuggestions(plannedMealId: string): Promise<WeeklyPlan>;
  updateParticipant(participantId: string, input: { confirmedQuantity: number; confirmedUnit: string }): Promise<WeeklyPlan>;
  getRequirements(weeklyPlanId: string): Promise<WeeklyRequirements>;
  compareInventory(weeklyPlanId: string): Promise<InventoryComparison>;
  getShoppingItems(weeklyPlanId: string): Promise<void>;
  addMissingShoppingItems(weeklyPlanId: string, items: Array<{ foodId: string; name?: string; unit: string; quantity?: number }>): Promise<void>;
  getPreparation(plannedMealId: string): Promise<unknown>;
  prepare(plannedMealId: string): Promise<unknown>;
  getConsumption(plannedMealId: string): Promise<unknown | null>;
  linkConsumption(consumedMealId: string, plannedMealId: string): Promise<WeeklyPlan>;
  getAdherence(weeklyPlanId: string): Promise<AdherenceSummary>;
}
