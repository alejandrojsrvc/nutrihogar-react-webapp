import type {
  FoodCatalogGateway,
  FoodDetail,
  UpdateCustomFoodInput,
} from '../ports/FoodCatalogGateway';

export class UpdateCustomFoodUseCase {
  constructor(private readonly foodCatalogGateway: FoodCatalogGateway) {}

  execute(foodId: string, input: UpdateCustomFoodInput): Promise<FoodDetail> {
    return this.foodCatalogGateway.updateCustomFood(foodId, input);
  }
}
