import type { MealGateway } from '../ports/MealGateway';

export class CancelMealUseCase {
  constructor(private readonly gateway: MealGateway) {}

  execute(mealId: string): Promise<void> {
    return this.gateway.cancel(mealId);
  }
}
