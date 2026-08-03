import type { RecipeGateway, UpdateRecipeInput } from '../ports/RecipeGateway';

export class UpdateRecipeUseCase {
  constructor(private readonly gateway: RecipeGateway) {}
  execute(recipeId: string, input: UpdateRecipeInput) {
    return this.gateway.update(recipeId, input);
  }
}
