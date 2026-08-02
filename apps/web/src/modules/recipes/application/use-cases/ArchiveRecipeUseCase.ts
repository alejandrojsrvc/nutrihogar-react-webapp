import type { RecipeGateway } from '../ports/RecipeGateway';

export class ArchiveRecipeUseCase {
  constructor(private readonly gateway: RecipeGateway) {}
  execute(recipeId: string) { return this.gateway.archive(recipeId); }
}
