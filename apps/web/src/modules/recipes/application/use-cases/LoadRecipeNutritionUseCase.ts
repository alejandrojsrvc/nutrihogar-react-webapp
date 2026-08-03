import type { RecipeGateway } from '../ports/RecipeGateway';

export class LoadRecipeNutritionUseCase {
  constructor(private readonly gateway: RecipeGateway) {}
  execute(recipeId: string) {
    return this.gateway.getNutrition(recipeId);
  }
}
