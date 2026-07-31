import type { MealFormValues } from '@nutrihogar/schemas';
import type { FoodSelection } from '../../../food-catalog/application/ports/FoodCatalogGateway';

export interface MealDraftItem extends FoodSelection {
  id: string;
}

export interface RegisteredMeal {
  id: string;
  mealType: string;
  consumedAt: string;
  totals: Record<string, number>;
}

export interface MealNutrientSnapshot {
  code: string;
  name: string;
  unit: string;
  amount: number;
}

export interface MealItemSnapshot {
  id: string;
  foodId: string | null;
  foodName: string;
  brand: string | null;
  preparationState: string | null;
  foodServingId: string | null;
  measurementMethod: string;
  confidenceLevel: string | null;
  quantity: number;
  baseQuantity: number;
  unit: string;
  baseUnit: string;
  nutrients: MealNutrientSnapshot[];
  totals: Record<string, number>;
}

export interface MealDetails extends RegisteredMeal {
  notes: string | null;
  householdId: string | null;
  adultProfileId: string | null;
  status: string;
  source: string;
  items: MealItemSnapshot[];
}

export interface RegisterMealInput extends Omit<MealFormValues, 'items'> {
  householdId: string;
  items: Array<{
    foodId: string;
    servingId?: string;
    quantity: number;
    unit: string;
    measurementMethod: string;
  }>;
}

export type UpdateMealInput = Omit<RegisterMealInput, 'householdId' | 'profileId'>;

export interface DuplicateMealInput {
  adultProfileId: string;
  mealType: string;
  consumedAt: Date;
}

export interface MealGateway {
  register(input: RegisterMealInput): Promise<RegisteredMeal>;
  getById(mealId: string): Promise<MealDetails>;
  update(mealId: string, input: UpdateMealInput): Promise<MealDetails>;
  cancel(mealId: string): Promise<void>;
  duplicate(mealId: string, input: DuplicateMealInput): Promise<MealDetails>;
}
