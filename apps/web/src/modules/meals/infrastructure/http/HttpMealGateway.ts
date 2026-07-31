import { ApiClientError, normalizeApiError, type ApiClient } from '@nutrihogar/api-client';
import type { DuplicateMealInput, MealDetails, MealGateway, RegisterMealInput, RegisteredMeal, UpdateMealInput } from '../../application/ports/MealGateway';
import { toMealDetails, toRegisteredMeal } from '../mappers/MealApiMapper';

type ApiResult<T> = { data?: T; error?: unknown; response?: Response };

interface MealApiClient {
  POST(path: string, options: { params: { path: { householdId: string } }; body: unknown }): Promise<ApiResult<unknown>>;
  POST(path: string, options: { params: { path: { mealId: string } }; body: unknown }): Promise<ApiResult<unknown>>;
  GET(path: string, options: { params: { path: { mealId: string } } }): Promise<ApiResult<unknown>>;
  PATCH(path: string, options: { params: { path: { mealId: string } }; body: unknown }): Promise<ApiResult<unknown>>;
  DELETE(path: string, options: { params: { path: { mealId: string } }}): Promise<ApiResult<unknown>>;
}

export class HttpMealGateway implements MealGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async register(input: RegisterMealInput): Promise<RegisteredMeal> {
    try {
      const result = await (this.apiClient as unknown as MealApiClient).POST(`/api/households/${input.householdId}/meals`, {
        params: { path: { householdId: input.householdId } },
        body: {
          adultProfileId: input.profileId,
          consumedAt: input.consumedAt.toISOString(),
          items: input.items,
          mealType: input.mealType,
          notes: input.notes || null,
        },
      });
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      if (!result.data) throw new ApiClientError('unknown', 'La API no devolvio la comida registrada.');
      return toRegisteredMeal(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getById(mealId: string): Promise<MealDetails> {
    try {
      const result = await (this.apiClient as unknown as MealApiClient).GET(`/api/meals/${mealId}`, {
        params: { path: { mealId } },
      });
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      if (!result.data) throw new ApiClientError('unknown', 'La API no devolvio el detalle de la comida.');
      return toMealDetails(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async update(mealId: string, input: UpdateMealInput): Promise<MealDetails> {
    try {
      const result = await (this.apiClient as unknown as MealApiClient).PATCH(`/api/meals/${mealId}`, {
        params: { path: { mealId } },
        body: {
          consumedAt: input.consumedAt.toISOString(),
          items: input.items,
          mealType: input.mealType,
          notes: input.notes || null,
        },
      });
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      if (!result.data) throw new ApiClientError('unknown', 'La API no devolvio la comida actualizada.');
      return toMealDetails(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async cancel(mealId: string): Promise<void> {
    try {
      const result = await (this.apiClient as unknown as MealApiClient).DELETE(`/api/meals/${mealId}`, {
        params: { path: { mealId } },
      });
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async duplicate(mealId: string, input: DuplicateMealInput): Promise<MealDetails> {
    try {
      const result = await (this.apiClient as unknown as MealApiClient).POST(`/api/meals/${mealId}/duplicate`, {
        params: { path: { mealId } },
        body: {
          adultProfileId: input.adultProfileId,
          consumedAt: input.consumedAt.toISOString(),
          mealType: input.mealType,
        },
      });
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      if (!result.data) throw new ApiClientError('unknown', 'La API no devolvio la comida duplicada.');
      return toMealDetails(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
