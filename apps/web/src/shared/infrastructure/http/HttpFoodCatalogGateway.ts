import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
  type components,
  type paths,
} from '@nutrihogar/api-client';

import type {
  FoodCatalogGateway,
  FoodCategory,
  FoodDetail,
  FoodSearchCriteria,
  FoodSummary,
} from '../../../modules/food-catalog/application/ports/FoodCatalogGateway';

type GeneratedFoodSearchQuery = NonNullable<
  paths['/api/foods']['get']['parameters']['query']
>;

export class HttpFoodCatalogGateway implements FoodCatalogGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async search(criteria: FoodSearchCriteria) {
    try {
      const result = await this.apiClient.GET('/api/foods', {
        params: {
          query: {
            ...(criteria.query ? { query: criteria.query } : {}),
            ...(criteria.categoryId ? { categoryId: criteria.categoryId } : {}),
            ...(criteria.preparationState
              ? { preparationState: criteria.preparationState }
              : {}),
            page: criteria.page,
            limit: criteria.limit,
          } as unknown as GeneratedFoodSearchQuery,
        },
      });

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio los resultados de alimentos.',
        );
      }

      return {
        items: result.data.items.map(toFoodSummary),
        pagination: result.data.pagination,
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getById(foodId: string) {
    try {
      const result = await this.apiClient.GET('/api/foods/{foodId}', {
        params: { path: { foodId } },
      });

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio el detalle del alimento.',
        );
      }

      return toFoodDetail(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async listCategories() {
    try {
      const result = await this.apiClient.GET('/api/food-categories');

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio las categorias de alimentos.',
        );
      }

      return result.data.map(toFoodCategory);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function toFoodCategory(
  value: components['schemas']['CategoryResponseDto'],
): FoodCategory {
  return {
    code: value.code,
    displayOrder: value.displayOrder,
    id: value.id,
    name: value.name,
  };
}

function toFoodSummary(
  value: components['schemas']['FoodSummaryResponseDto'],
): FoodSummary {
  return {
    brand: toNullableText(value.brand),
    carbohydrateGrams: toNullableNumber(value.carbohydrateGrams),
    category: toFoodCategory(value.category),
    energyKcal: toNullableNumber(value.energyKcal),
    fatGrams: toNullableNumber(value.fatGrams),
    foodType: value.foodType,
    householdId: toNullableText(value.householdId),
    id: value.id,
    name: value.name,
    preparationState: value.preparationState,
    proteinGrams: toNullableNumber(value.proteinGrams),
    referenceQuantity: value.referenceQuantity,
    referenceUnit: value.referenceUnit,
  };
}

function toFoodDetail(
  value: components['schemas']['FoodDetailResponseDto'],
): FoodDetail {
  return {
    ...toFoodSummary(value),
    aliases: value.aliases,
    confidenceLevel: value.confidenceLevel,
    description: toNullableText(value.description),
    isGlobal: value.isGlobal,
    nutrients: value.nutrients.map((nutrient) => ({
      amount: nutrient.amount,
      id: nutrient.id,
      nutrientDefinition: nutrient.nutrientDefinition,
    })),
    servings: value.servings.map((serving) => ({
      equivalentGrams: toNullableNumber(serving.equivalentGrams),
      equivalentMilliliters: toNullableNumber(serving.equivalentMilliliters),
      id: serving.id,
      name: serving.name,
      quantity: serving.quantity,
      unit: serving.unit,
    })),
    source: value.source,
    sourceReference: toNullableText(value.sourceReference),
  };
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toNullableText(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
