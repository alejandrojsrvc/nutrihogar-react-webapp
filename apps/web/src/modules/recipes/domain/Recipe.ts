export interface RecipeIngredient {
  id: string;
  foodId: string;
  quantity: number;
  unit: string;
  servingId: string | null;
  position: number;
  notes: string | null;
}

export interface RecipeInstruction {
  id: string;
  position: number;
  description: string;
}

export interface Recipe {
  id: string;
  householdId: string;
  createdById: string;
  name: string;
  description: string | null;
  category: string | null;
  defaultServings: number;
  estimatedPreparationMinutes: number | null;
  tags: string[];
  status: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeNutrition {
  recipeId: string;
  servings: number;
  ingredients: Array<{
    ingredientId: string;
    foodId: string;
    baseQuantity: number;
    baseUnit: string;
    nutrients: Record<string, number>;
  }>;
  totalNutrients: Record<string, number>;
  perServingNutrients: Record<string, number>;
  warnings: Array<{
    ingredientId: string;
    foodId: string;
    code: string;
    message: string;
  }>;
}
