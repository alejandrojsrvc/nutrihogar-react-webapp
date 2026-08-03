import type { RecipeGateway } from '../ports/RecipeGateway';

export class LoadRecipeUseCase {
  constructor(private readonly gateway: RecipeGateway) {}
  execute(recipeId: string) {
    return this.gateway.getById(recipeId);
  }
}
