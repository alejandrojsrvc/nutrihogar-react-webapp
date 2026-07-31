import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';

import type {
  NutritionGoal,
  NutritionGoalGateway,
  NutritionGoalSuggestion,
  NutritionGoalValues,
} from '../../application/ports/NutritionGoalGateway';

type ApiResult<T> = { data?: T; error?: unknown; response?: Response };

interface NutritionGoalApiClient {
  POST(path: string, options: { params: { path: Record<string, string> }; body?: unknown }): Promise<ApiResult<unknown>>;
  GET(path: string, options: { params: { path: Record<string, string> } }): Promise<ApiResult<unknown>>;
}

export class HttpNutritionGoalGateway implements NutritionGoalGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async generateSuggestion(profileId: string): Promise<NutritionGoalSuggestion> {
    try {
      const result = await this.client().POST(
        `/api/adult-profiles/${profileId}/nutrition-goal-suggestions`,
        { params: { path: { profileId } } },
      );
      return toSuggestion(this.requireData(result, 'generar la propuesta'));
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async confirmSuggestion(
    suggestionId: string,
    values: Partial<NutritionGoalValues>,
  ): Promise<NutritionGoal> {
    try {
      const result = await this.client().POST(
        `/api/nutrition-goal-suggestions/${suggestionId}/confirm`,
        { params: { path: { suggestionId } }, body: values },
      );
      return toGoal(this.requireData(result, 'confirmar la meta'));
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getCurrent(profileId: string): Promise<NutritionGoal | null> {
    try {
      const result = await this.client().GET(
        `/api/adult-profiles/${profileId}/nutrition-goals/current`,
        { params: { path: { profileId } } },
      );
      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }
      return result.data ? toGoal(result.data) : null;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  private client(): NutritionGoalApiClient {
    // The generated snapshot predates the nutrition endpoints. Keep this
    // compatibility boundary in infrastructure until the API snapshot lands.
    return this.apiClient as unknown as NutritionGoalApiClient;
  }

  private requireData(result: ApiResult<unknown>, action: string): unknown {
    if (result.error !== undefined) {
      throw normalizeApiError(result.error, result.response);
    }
    if (!result.data) {
      throw new ApiClientError('unknown', `La API no devolvio datos al ${action}.`);
    }
    return result.data;
  }
}

function toSuggestion(value: unknown): NutritionGoalSuggestion {
  const source = value as Record<string, unknown>;
  const calculation = (source.calculation ?? {}) as Record<string, unknown>;
  const suggestion = (source.suggestion ?? {}) as Record<string, unknown>;
  return {
    id: String(source.id),
    calculation: {
      activityFactor: Number(calculation.activityFactor ?? 0),
      bmr: Number(calculation.bmr ?? 0),
      deficit: calculation.deficit == null ? null : Number(calculation.deficit),
      tdee: Number(calculation.tdee ?? 0),
    },
    status: typeof source.status === 'string' ? source.status : 'PENDING',
    suggestion: toValues(suggestion),
  };
}

function toGoal(value: unknown): NutritionGoal {
  const source = value as Record<string, unknown>;
  return {
    adultProfileId: String(source.adultProfileId),
    calculationMethod: String(source.calculationMethod ?? ''),
    dailyCalories: Number(source.dailyCalories),
    fatGrams: Number(source.fatGrams),
    fiberGrams: Number(source.fiberGrams),
    goalType: String(source.goalType ?? ''),
    id: String(source.id),
    proteinGrams: Number(source.proteinGrams),
    carbohydrateGrams: Number(source.carbohydrateGrams),
    validFrom: String(source.validFrom),
    validUntil: source.validUntil == null ? null : String(source.validUntil),
  };
}

function toValues(value: Record<string, unknown>): NutritionGoalValues {
  return {
    carbohydrateGrams: Number(value.carbohydrateGrams ?? 0),
    dailyCalories: Number(value.dailyCalories ?? 0),
    fatGrams: Number(value.fatGrams ?? 0),
    fiberGrams: Number(value.fiberGrams ?? 0),
    proteinGrams: Number(value.proteinGrams ?? 0),
  };
}
