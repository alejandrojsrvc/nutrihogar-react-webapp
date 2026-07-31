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

export interface MealDetails extends RegisteredMeal {
  notes: string | null;
  items: Array<{
    foodId: string | null;
    foodName: string;
    foodServingId: string | null;
    measurementMethod: string;
    quantity: number;
    unit: string;
    totals: Record<string, number>;
  }>;
}

export interface RegisterMealInput extends Omit<MealFormValues, 'items'> {
  householdId: string;
  items: Array<{
    foodId: string;
    quantity: number;
    unit: string;
    measurementMethod: string;
  }>;
}

export interface MealGateway {
  register(input: RegisterMealInput): Promise<RegisteredMeal>;
}

export interface MealDetailsGateway {
  getById(mealId: string): Promise<MealDetails>;
}
