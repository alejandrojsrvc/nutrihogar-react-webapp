import { ApiClientError, normalizeApiError, type ApiClient } from '@nutrihogar/api-client';
import type { MealDetails, MealGateway, RegisterMealInput, RegisteredMeal } from '../../application/ports/MealGateway';

type ApiResult<T> = { data?: T; error?: unknown; response?: Response };

interface MealApiClient {
  POST(path: string, options: { params: { path: { householdId: string } }; body: unknown }): Promise<ApiResult<unknown>>;
  GET(path: string, options: { params: { path: { mealId: string } } }): Promise<ApiResult<unknown>>;
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
}

function toRegisteredMeal(value: unknown): RegisteredMeal {
  const source = value as Record<string, unknown>;
  const totals = source.totals as Record<string, unknown> | undefined;
  return {
    consumedAt: String(source.consumedAt),
    id: String(source.id),
    mealType: String(source.mealType),
    totals: Object.fromEntries(Object.entries(totals ?? {}).map(([key, item]) => [key, Number(item)])),
  };
}

function toMealDetails(value: unknown): MealDetails {
  const source = value as Record<string, unknown>;
  const registered = toRegisteredMeal(source);
  return {
    ...registered,
    items: Array.isArray(source.items)
      ? source.items.map((item) => {
          const current = item as Record<string, unknown>;
          return {
            foodId: String(current.foodId),
            foodName: String(current.foodName ?? current.name ?? 'Alimento'),
            measurementMethod: String(current.measurementMethod ?? ''),
            quantity: Number(current.quantity ?? 0),
            totals: Object.fromEntries(
              Object.entries((current.totals ?? {}) as Record<string, unknown>).map(([key, amount]) => [key, Number(amount)]),
            ),
            unit: String(current.unit ?? ''),
          };
        })
      : [],
    notes: source.notes == null ? null : String(source.notes),
  };
}
