import type { RecipeGateway, RecipeListCriteria } from '../ports/RecipeGateway';

export class ListRecipesUseCase {
  constructor(private readonly gateway: RecipeGateway) {}
  execute(householdId: string, criteria: RecipeListCriteria) {
    return this.gateway.list(householdId, {
      ...criteria,
      query: criteria.query?.trim() || undefined,
    });
  }
}
