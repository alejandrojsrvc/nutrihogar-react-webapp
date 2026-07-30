import type {
  FoodCatalogGateway,
  FoodDetail,
} from '../ports/FoodCatalogGateway';

export class GetFoodDetailUseCase {
  constructor(private readonly foodCatalogGateway: FoodCatalogGateway) {}

  execute(foodId: string): Promise<FoodDetail> {
    return this.foodCatalogGateway.getById(foodId);
  }
}
