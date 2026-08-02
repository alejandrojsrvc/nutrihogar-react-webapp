import type { NutritionSummary } from '@nutrihogar/domain';

export type DailyNutritionGoal = NutritionSummary;

export interface DailyNutritionMeal {
  id: string;
  consumedAt: string;
  mealType: string;
  source?: string;
  preparation?: {
    preparedBatchId: string | null;
    recipeName: string | null;
  } | null;
  totals: NutritionSummary;
}

export interface DailyNutritionSummary {
  date: string;
  profile: { id: string; name: string };
  goal: DailyNutritionGoal | null;
  consumed: NutritionSummary;
  remaining: NutritionSummary | null;
  meals: DailyNutritionMeal[];
}

export interface DailyNutritionSummaryGateway {
  getByProfileAndDate(
    profileId: string,
    date: string,
  ): Promise<DailyNutritionSummary>;
}
