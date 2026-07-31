import type { MealDetails, MealGateway } from '../ports/MealGateway';

export class GetMealDetailsUseCase {
  constructor(private readonly mealGateway: MealGateway) {}

  execute(mealId: string): Promise<MealDetails> {
    return this.mealGateway.getById(mealId);
  }
}
