import type { Recipe } from '../../domain/Recipe';

export interface RecipeListCriteria {
  query?: string;
  category?: string;
  status?: string;
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
  ingredients: Array<{ foodId: string; quantity: number; unit: string; servingId?: string | null; position: number }>;
  instructions?: Array<{ position: number; description: string }>;
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

export interface RecipeGateway {
  create(householdId: string, input: CreateRecipeInput): Promise<Recipe>;
  update(recipeId: string, input: UpdateRecipeInput): Promise<Recipe>;
  getById(recipeId: string): Promise<Recipe>;
  list(householdId: string, criteria: RecipeListCriteria): Promise<RecipeListResult>;
}
