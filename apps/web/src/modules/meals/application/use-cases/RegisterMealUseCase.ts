import type { MealGateway, RegisterMealInput } from '../ports/MealGateway';

export class RegisterMealUseCase {
  constructor(private readonly gateway: MealGateway) {}

  execute(input: RegisterMealInput) {
    if (input.items.length === 0) {
      throw new Error('Una comida debe tener al menos un alimento.');
    }
    return this.gateway.register(input);
  }
}
