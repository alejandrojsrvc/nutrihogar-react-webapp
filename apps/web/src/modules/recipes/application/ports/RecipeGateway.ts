import type { Recipe, RecipeNutrition } from '../../domain/Recipe';

export interface RecipeListCriteria {
  query?: string;
  category?: string;
  page: number;
  limit: number;
}

export interface RecipeListResult {
  items: Recipe[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateRecipeInput {
  name: string;
  description?: string | null;
  category?: string | null;
  defaultServings: number;
  estimatedPreparationMinutes?: number | null;
  tags?: string[];
  ingredients: Array<{
    id?: string;
    foodId: string;
    quantity: number;
    unit: string;
    servingId?: string | null;
    position: number;
    notes?: string | null;
  }>;
  instructions?: Array<{ id?: string; position: number; description: string }>;
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

export interface RecipeGateway {
  create(householdId: string, input: CreateRecipeInput): Promise<Recipe>;
  update(recipeId: string, input: UpdateRecipeInput): Promise<Recipe>;
  getById(recipeId: string): Promise<Recipe>;
  getNutrition(recipeId: string): Promise<RecipeNutrition>;
  archive(recipeId: string): Promise<void>;
  list(
    householdId: string,
    criteria: RecipeListCriteria,
  ): Promise<RecipeListResult>;
}
