import type { NutritionGoalValues } from '@nutrihogar/schemas';

export type { NutritionGoalValues } from '@nutrihogar/schemas';

export interface NutritionGoalCalculation {
  bmr: number;
  activityFactor: number;
  tdee: number;
  deficit: number | null;
}

export interface NutritionGoalSuggestion {
  id: string;
  calculation: NutritionGoalCalculation;
  suggestion: NutritionGoalValues;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | string;
}

export interface NutritionGoal extends NutritionGoalValues {
  id: string;
  adultProfileId: string;
  goalType: string;
  calculationMethod: string;
  validFrom: string;
  validUntil: string | null;
}

export interface NutritionGoalGateway {
  generateSuggestion(profileId: string): Promise<NutritionGoalSuggestion>;
  confirmSuggestion(
    suggestionId: string,
    values: Partial<NutritionGoalValues>,
  ): Promise<NutritionGoal>;
  getCurrent(profileId: string): Promise<NutritionGoal | null>;
}
