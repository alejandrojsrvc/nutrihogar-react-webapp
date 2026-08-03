import type {
  DuplicateMealInput,
  MealDetails,
  MealGateway,
} from '../ports/MealGateway';

export class DuplicateMealUseCase {
  constructor(private readonly gateway: MealGateway) {}

  execute(mealId: string, input: DuplicateMealInput): Promise<MealDetails> {
    return this.gateway.duplicate(mealId, input);
  }
}
