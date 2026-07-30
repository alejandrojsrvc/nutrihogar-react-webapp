import type {
  FoodCatalogGateway,
  FoodCategory,
} from '../ports/FoodCatalogGateway';

export class ListFoodCategoriesUseCase {
  constructor(private readonly foodCatalogGateway: FoodCatalogGateway) {}

  execute(): Promise<FoodCategory[]> {
    return this.foodCatalogGateway.listCategories();
  }
}
