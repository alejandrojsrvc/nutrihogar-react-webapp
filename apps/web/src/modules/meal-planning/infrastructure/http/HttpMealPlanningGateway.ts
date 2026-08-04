import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
  type components,
} from '@nutrihogar/api-client';
import type {
  MealPlanningGateway,
  MealPlanListCriteria,
  PlannedMealInput,
} from '../../application/ports/MealPlanningGateway';
import {
  toAdherenceSummary,
  toInventoryComparison,
  toPlannedMealRequest,
  toQuantitySuggestion,
  toUpdatePlannedMealRequest,
  toWeeklyPlan,
  toWeeklyRequirements,
} from '../mappers/MealPlanningApiMapper';

type Result = { data?: unknown; error?: unknown; response?: Response };
type Client = {
  GET(
    path: string,
    options: {
      params: { path: Record<string, string>; query?: Record<string, unknown> };
    },
  ): Promise<Result>;
  POST(
    path: string,
    options: { params: { path: Record<string, string> }; body?: unknown },
  ): Promise<Result>;
  PATCH(
    path: string,
    options: { params: { path: Record<string, string> }; body: unknown },
  ): Promise<Result>;
  DELETE(
    path: string,
    options: { params: { path: Record<string, string> } },
  ): Promise<Result>;
};

export class HttpMealPlanningGateway implements MealPlanningGateway {
  constructor(private readonly apiClient: ApiClient) {}
  async list(householdId: string, criteria: MealPlanListCriteria) {
    const query: Record<string, unknown> = {
      limit: criteria.limit,
      page: criteria.page,
    };
    const result = await this.request(() =>
      (this.apiClient as unknown as Client).GET(
        `/api/households/${householdId}/weekly-plans`,
        { params: { path: { householdId }, query } },
      ),
    );
    const data = result as components['schemas']['WeeklyPlanListResponseDto'];
    return {
      items: Array.isArray(data.items) ? data.items.map(toWeeklyPlan) : [],
      page: Number(data.page ?? criteria.page),
      limit: Number(data.limit ?? criteria.limit),
      total: Number(data.total ?? 0),
    };
  }
  async get(weeklyPlanId: string) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).GET(
          `/api/weekly-plans/${weeklyPlanId}`,
          { params: { path: { weeklyPlanId } } },
        ),
      ),
    );
  }
  async create(householdId: string, weekStart: string) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/households/${householdId}/weekly-plans`,
          { params: { path: { householdId } }, body: { weekStart } },
        ),
      ),
    );
  }
  async addMeal(weeklyPlanId: string, input: PlannedMealInput) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/weekly-plans/${weeklyPlanId}/meals`,
          {
            params: { path: { weeklyPlanId } },
            body: toPlannedMealRequest(input),
          },
        ),
      ),
    );
  }
  async updateMeal(plannedMealId: string, input: Partial<PlannedMealInput>) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).PATCH(
          `/api/planned-meals/${plannedMealId}`,
          {
            params: { path: { plannedMealId } },
            body: toUpdatePlannedMealRequest(input),
          },
        ),
      ),
    );
  }
  async assignParticipant(plannedMealId: string, adultProfileId: string) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/planned-meals/${plannedMealId}/participants`,
          { params: { path: { plannedMealId } }, body: { adultProfileId } },
        ),
      ),
    );
  }
  async deleteParticipant(participantId: string) {
    await this.request(
      () =>
        (this.apiClient as unknown as Client).DELETE(
          `/api/planned-meal-participants/${participantId}`,
          { params: { path: { participantId } } },
        ),
      true,
    );
  }
  async proposeQuantities(plannedMealId: string) {
    return (
      (await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/planned-meals/${plannedMealId}/quantities/propose`,
          { params: { path: { plannedMealId } } },
        ),
      )) as unknown[]
    ).map(toQuantitySuggestion);
  }
  async listQuantities(plannedMealId: string) {
    return (
      (await this.request(() =>
        (this.apiClient as unknown as Client).GET(
          `/api/planned-meals/${plannedMealId}/quantities`,
          { params: { path: { plannedMealId } } },
        ),
      )) as unknown[]
    ).map(toQuantitySuggestion);
  }
  async acceptQuantitySuggestions(plannedMealId: string) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/planned-meals/${plannedMealId}/quantities/accept-suggestions`,
          { params: { path: { plannedMealId } } },
        ),
      ),
    );
  }
  async updateParticipant(
    participantId: string,
    input: { confirmedQuantity: number; confirmedUnit: string },
  ) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).PATCH(
          `/api/planned-meal-participants/${participantId}`,
          { params: { path: { participantId } }, body: input },
        ),
      ),
    );
  }
  async getRequirements(weeklyPlanId: string) {
    return toWeeklyRequirements(
      await this.request(() =>
        (this.apiClient as unknown as Client).GET(
          `/api/weekly-plans/${weeklyPlanId}/requirements`,
          { params: { path: { weeklyPlanId } } },
        ),
      ),
    );
  }
  async compareInventory(weeklyPlanId: string) {
    return toInventoryComparison(
      await this.request(() =>
        (this.apiClient as unknown as Client).GET(
          `/api/weekly-plans/${weeklyPlanId}/inventory-comparison`,
          { params: { path: { weeklyPlanId } } },
        ),
      ),
    );
  }
  async getShoppingItems(weeklyPlanId: string) {
    await this.request(
      () =>
        (this.apiClient as unknown as Client).GET(
          `/api/weekly-plans/${weeklyPlanId}/shopping-list/items`,
          { params: { path: { weeklyPlanId } } },
        ),
      true,
    );
  }
  async addMissingShoppingItems(
    weeklyPlanId: string,
    items: Array<{
      foodId: string;
      name?: string;
      unit: string;
      quantity?: number;
    }>,
  ) {
    await this.request(
      () =>
        (this.apiClient as unknown as Client).POST(
          `/api/weekly-plans/${weeklyPlanId}/shopping-list/items`,
          { params: { path: { weeklyPlanId } }, body: { items } },
        ),
      true,
    );
  }
  async getPreparation(plannedMealId: string) {
    try {
      return await this.request(() =>
        (this.apiClient as unknown as Client).GET(
          `/api/planned-meals/${plannedMealId}/preparation`,
          { params: { path: { plannedMealId } } },
        ),
      );
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) return null;
      throw error;
    }
  }
  async prepare(plannedMealId: string) {
    return this.request(() =>
      (this.apiClient as unknown as Client).POST(
        `/api/planned-meals/${plannedMealId}/preparation`,
        { params: { path: { plannedMealId } } },
      ),
    );
  }
  async getConsumption(plannedMealId: string) {
    return this.request(() =>
      (this.apiClient as unknown as Client).GET(
        `/api/planned-meals/${plannedMealId}/consumption`,
        { params: { path: { plannedMealId } } },
      ),
    );
  }
  async linkConsumption(consumedMealId: string, plannedMealId: string) {
    return toWeeklyPlan(
      await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/consumed-meals/${consumedMealId}/link`,
          { params: { path: { consumedMealId } }, body: { plannedMealId } },
        ),
      ),
    );
  }
  async getAdherence(weeklyPlanId: string) {
    return toAdherenceSummary(
      await this.request(() =>
        (this.apiClient as unknown as Client).GET(
          `/api/weekly-plans/${weeklyPlanId}/adherence`,
          { params: { path: { weeklyPlanId } } },
        ),
      ),
    );
  }
  private async request(request: () => Promise<Result>, allowEmpty = false) {
    try {
      const result = await request();
      if (result.error !== undefined)
        throw normalizeApiError(result.error, result.response);
      if (result.response && !result.response.ok)
        throw normalizeApiError(undefined, result.response);
      if (!allowEmpty && !result.data)
        throw new ApiClientError('unknown', 'La API no devolvio datos.');
      return result.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
