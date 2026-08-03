import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';
import type {
  DailyNutritionSummary,
  DailyNutritionSummaryGateway,
} from '../../application/ports/DailyNutritionSummaryGateway';
import type { NutritionSummary } from '@nutrihogar/domain';

type ApiResult<T> = { data?: T; error?: unknown; response?: Response };

interface DailyNutritionSummaryApiClient {
  GET(
    path: string,
    options: {
      params: { path: { profileId: string }; query: { date: string } };
    },
  ): Promise<ApiResult<unknown>>;
}

export class HttpDailyNutritionSummaryGateway implements DailyNutritionSummaryGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async getByProfileAndDate(
    profileId: string,
    date: string,
  ): Promise<DailyNutritionSummary> {
    try {
      const result = await (
        this.apiClient as unknown as DailyNutritionSummaryApiClient
      ).GET(`/api/adult-profiles/${profileId}/daily-nutrition-summary`, {
        params: { path: { profileId }, query: { date } },
      });
      if (result.error !== undefined)
        throw normalizeApiError(result.error, result.response);
      if (!result.data)
        throw new ApiClientError(
          'unknown',
          'La API no devolvio el resumen diario.',
        );
      return toDailyNutritionSummary(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

export function toDailyNutritionSummary(value: unknown): DailyNutritionSummary {
  const source = value as Record<string, unknown>;
  return {
    consumed: toNutritionSummary(source.consumed),
    date: String(source.date),
    goal: source.goal ? toNutritionSummary(source.goal) : null,
    meals: Array.isArray(source.meals) ? source.meals.map(toMeal) : [],
    profile: { id: String(source.profileId), name: String(source.profileName) },
    remaining: source.remaining ? toNutritionSummary(source.remaining) : null,
  };
}

function toMeal(value: unknown) {
  const source = value as Record<string, unknown>;
  const reference = source.sourceReference ?? source.preparation;
  const preparation =
    reference && typeof reference === 'object'
      ? (reference as Record<string, unknown>)
      : null;
  return {
    consumedAt: String(source.consumedAt),
    id: String(source.id),
    mealType: String(source.mealType),
    preparation: preparation
      ? {
          preparedBatchId:
            preparation.preparedBatchId == null
              ? null
              : String(preparation.preparedBatchId ?? preparation.batchId),
          recipeName:
            preparation.recipeName == null
              ? null
              : String(
                  preparation.recipeName ?? preparation.recipeNameSnapshot,
                ),
        }
      : null,
    source: source.source == null ? undefined : String(source.source),
    totals: toNutritionSummary(source.totals),
  };
}

function toNutritionSummary(value: unknown): NutritionSummary {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    calories: Number(source.calories ?? source.dailyCalories ?? 0),
    carbohydrateGrams: Number(source.carbohydrateGrams ?? 0),
    fatGrams: Number(source.fatGrams ?? 0),
    fiberGrams: Number(source.fiberGrams ?? 0),
    proteinGrams: Number(source.proteinGrams ?? 0),
  };
}
