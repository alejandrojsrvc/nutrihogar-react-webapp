import type { CreateRecipeInput, RecipeGateway } from '../ports/RecipeGateway';

export class CreateRecipeUseCase {
  constructor(private readonly gateway: RecipeGateway) {}
  execute(householdId: string, input: CreateRecipeInput) {
    return this.gateway.create(householdId, input);
  }
}
