import type { MealDetails, UpdateMealInput, MealGateway } from '../ports/MealGateway';

export class UpdateMealUseCase {
  constructor(private readonly gateway: MealGateway) {}

  execute(mealId: string, input: UpdateMealInput): Promise<MealDetails> {
    if (input.items.length === 0) throw new Error('Una comida debe tener al menos un alimento.');
    return this.gateway.update(mealId, input);
  }
}
