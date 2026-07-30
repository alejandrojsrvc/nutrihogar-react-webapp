import type {
  FoodCatalogGateway,
  FoodSearchCriteria,
  FoodSearchResult,
} from '../ports/FoodCatalogGateway';

export class SearchFoodsUseCase {
  constructor(private readonly foodCatalogGateway: FoodCatalogGateway) {}

  execute(criteria: FoodSearchCriteria): Promise<FoodSearchResult> {
    return this.foodCatalogGateway.search({
      ...criteria,
      query: criteria.query?.trim() || undefined,
    });
  }
}
