import type {
  CustomFoodInput,
  FoodCatalogGateway,
  FoodDetail,
} from '../ports/FoodCatalogGateway';

export class CreateCustomFoodUseCase {
  constructor(private readonly foodCatalogGateway: FoodCatalogGateway) {}

  execute(householdId: string, input: CustomFoodInput): Promise<FoodDetail> {
    return this.foodCatalogGateway.createCustomFood(householdId, input);
  }
}
