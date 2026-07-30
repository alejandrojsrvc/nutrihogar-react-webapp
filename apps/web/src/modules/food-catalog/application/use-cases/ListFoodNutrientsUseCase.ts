import type {
  FoodCatalogGateway,
  NutrientDefinition,
} from '../ports/FoodCatalogGateway';

export class ListFoodNutrientsUseCase {
  constructor(private readonly foodCatalogGateway: FoodCatalogGateway) {}

  execute(): Promise<NutrientDefinition[]> {
    return this.foodCatalogGateway.listNutrients();
  }
}
