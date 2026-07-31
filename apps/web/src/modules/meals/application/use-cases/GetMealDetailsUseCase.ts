import type { MealDetailsGateway } from '../ports/MealGateway';

export class GetMealDetailsUseCase {
  constructor(private readonly mealGateway: MealDetailsGateway) {}

  execute(mealId: string): Promise<MealDetails> {
    return this.mealGateway.getById(mealId);
  }
}
