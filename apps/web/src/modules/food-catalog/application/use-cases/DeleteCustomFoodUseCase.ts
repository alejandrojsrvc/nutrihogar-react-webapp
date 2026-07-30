import type { FoodCatalogGateway } from '../ports/FoodCatalogGateway';

export class DeleteCustomFoodUseCase {
  constructor(private readonly foodCatalogGateway: FoodCatalogGateway) {}

  execute(foodId: string): Promise<void> {
    return this.foodCatalogGateway.deleteCustomFood(foodId);
  }
}
