import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
  type components,
  type paths,
} from '@nutrihogar/api-client';

import type {
  CustomFoodInput,
  FoodCatalogGateway,
  FoodCategory,
  FoodDetail,
  FoodServingInput,
  FoodSearchCriteria,
  FoodSummary,
  NutrientDefinition,
  UpdateCustomFoodInput,
} from '../../../modules/food-catalog/application/ports/FoodCatalogGateway';

type GeneratedFoodSearchQuery = NonNullable<
  paths['/api/foods']['get']['parameters']['query']
>;

type MutationApiResult<T = unknown> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

type FoodMutationApiClient = {
  POST(
    path: '/api/households/{householdId}/foods',
    options: {
      body: unknown;
      params: { path: { householdId: string } };
    },
  ): Promise<MutationApiResult<components['schemas']['FoodDetailResponseDto']>>;
  PATCH(
    path: '/api/foods/{foodId}',
    options: { body: unknown; params: { path: { foodId: string } } },
  ): Promise<MutationApiResult<components['schemas']['FoodDetailResponseDto']>>;
  DELETE(
    path: '/api/foods/{foodId}',
    options: { params: { path: { foodId: string } } },
  ): Promise<MutationApiResult>;
};

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

  async listNutrients(): Promise<NutrientDefinition[]> {
    try {
      const result = await this.apiClient.GET('/api/nutrients');

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio las definiciones de nutrientes.',
        );
      }

      return result.data.map((nutrient) => ({
        code: nutrient.code,
        displayOrder: nutrient.displayOrder,
        group: nutrient.group,
        id: nutrient.id,
        isRequired: nutrient.isRequired,
        name: nutrient.name,
        unit: nutrient.unit,
      }));
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async createCustomFood(
    householdId: string,
    input: CustomFoodInput,
  ): Promise<FoodDetail> {
    try {
      const result = await this.mutationClient().POST(
        '/api/households/{householdId}/foods',
        {
          body: toCustomFoodRequest(input),
          params: { path: { householdId } },
        },
      );

      return this.requireFoodMutationData(result, 'crear');
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async updateCustomFood(
    foodId: string,
    input: UpdateCustomFoodInput,
  ): Promise<FoodDetail> {
    try {
      const result = await this.mutationClient().PATCH('/api/foods/{foodId}', {
        body: toCustomFoodRequest(input),
        params: { path: { foodId } },
      });

      return this.requireFoodMutationData(result, 'actualizar');
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async deleteCustomFood(foodId: string): Promise<void> {
    try {
      const result = await this.mutationClient().DELETE('/api/foods/{foodId}', {
        params: { path: { foodId } },
      });

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  private mutationClient(): FoodMutationApiClient {
    // The backend exposes these routes, but the committed OpenAPI snapshot
    // predates them. Keep the compatibility boundary inside infrastructure.
    return this.apiClient as unknown as FoodMutationApiClient;
  }

  private requireFoodMutationData(
    result: MutationApiResult<components['schemas']['FoodDetailResponseDto']>,
    action: string,
  ): FoodDetail {
    if (result.error !== undefined) {
      throw normalizeApiError(result.error, result.response);
    }

    if (!result.data) {
      throw new ApiClientError(
        'unknown',
        `La API no devolvio el alimento despues de ${action}lo.`,
      );
    }

    return toFoodDetail(result.data);
  }
}

function toCustomFoodRequest(
  input: CustomFoodInput | UpdateCustomFoodInput,
): Record<string, unknown> {
  const request: Record<string, unknown> = { ...input };

  if (input.servings !== undefined) {
    request.servings = input.servings.map(toFoodServingRequest);
  }

  return request;
}

function toFoodServingRequest(serving: FoodServingInput) {
  return {
    equivalentGrams: serving.equivalentGrams ?? null,
    equivalentMilliliters: serving.equivalentMilliliters ?? null,
    name: serving.name,
    quantity: serving.quantity,
    unit: serving.unit,
  };
}

function toFoodCategory(
  value: components['schemas']['CategoryResponseDto'],
): FoodCategory {
  return {
    code: String(value?.code ?? ''),
    displayOrder: Number(value?.displayOrder ?? 0),
    id: String(value?.id ?? ''),
    name: String(value?.name ?? ''),
  };
}

export function toFoodDetail(
  value: components['schemas']['FoodDetailResponseDto'],
): FoodDetail {
  return {
    ...toFoodSummary(value),
    aliases: Array.isArray(value.aliases) ? value.aliases : [],
    confidenceLevel: value.confidenceLevel ?? 'USER_PROVIDED',
    description: toNullableText(value.description),
    isGlobal: Boolean(value.isGlobal),
    nutrients: (Array.isArray(value.nutrients) ? value.nutrients : []).map(
      (nutrient) => ({
        amount: toNullableNumber(nutrient.amount) ?? 0,
        id: String(nutrient.id ?? ''),
        nutrientDefinition: nutrient.nutrientDefinition,
      }),
    ),
    servings: (Array.isArray(value.servings) ? value.servings : []).map(
      (serving) => ({
        equivalentGrams: toNullableNumber(serving.equivalentGrams),
        equivalentMilliliters: toNullableNumber(serving.equivalentMilliliters),
        id: String(serving.id ?? ''),
        name: String(serving.name ?? ''),
        quantity: toNullableNumber(serving.quantity) ?? 0,
        unit: String(serving.unit ?? ''),
      }),
    ),
    source: String(value.source ?? ''),
    sourceReference: toNullableText(value.sourceReference),
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
    referenceQuantity: toNullableNumber(value.referenceQuantity) ?? 0,
    referenceUnit: value.referenceUnit,
  };
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function toNullableText(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
