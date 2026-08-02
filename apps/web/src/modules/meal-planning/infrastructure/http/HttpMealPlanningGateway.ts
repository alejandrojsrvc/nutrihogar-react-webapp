import { ApiClientError, normalizeApiError, type ApiClient, type components } from '@nutrihogar/api-client';
import type { MealPlanningGateway, MealPlanListCriteria, PlannedMealInput } from '../../application/ports/MealPlanningGateway';
import { toPlannedMealRequest, toUpdatePlannedMealRequest, toWeeklyPlan } from '../mappers/MealPlanningApiMapper';

type Result = { data?: unknown; error?: unknown; response?: Response };
type Client = { GET(path: string, options: { params: { path: Record<string, string>; query?: Record<string, unknown> } }): Promise<Result>; POST(path: string, options: { params: { path: Record<string, string> }; body: unknown }): Promise<Result>; PATCH(path: string, options: { params: { path: Record<string, string> }; body: unknown }): Promise<Result> };

export class HttpMealPlanningGateway implements MealPlanningGateway {
  constructor(private readonly apiClient: ApiClient) {}
  async list(householdId: string, criteria: MealPlanListCriteria) {
    const result = await this.request(() => (this.apiClient as unknown as Client).GET(`/api/households/${householdId}/weekly-plans`, { params: { path: { householdId }, query: criteria } }));
    const data = result as components['schemas']['WeeklyPlanListResponseDto'];
    return { items: Array.isArray(data.items) ? data.items.map(toWeeklyPlan) : [], page: Number(data.page ?? criteria.page), limit: Number(data.limit ?? criteria.limit), total: Number(data.total ?? 0) };
  }
  async get(weeklyPlanId: string) { return toWeeklyPlan(await this.request(() => (this.apiClient as unknown as Client).GET(`/api/weekly-plans/${weeklyPlanId}`, { params: { path: { weeklyPlanId } } })) ); }
  async create(householdId: string, weekStart: string) { return toWeeklyPlan(await this.request(() => (this.apiClient as unknown as Client).POST(`/api/households/${householdId}/weekly-plans`, { params: { path: { householdId } }, body: { weekStart } }))); }
  async addMeal(weeklyPlanId: string, input: PlannedMealInput) { return toWeeklyPlan(await this.request(() => (this.apiClient as unknown as Client).POST(`/api/weekly-plans/${weeklyPlanId}/meals`, { params: { path: { weeklyPlanId } }, body: toPlannedMealRequest(input) }))); }
  async updateMeal(plannedMealId: string, input: Partial<PlannedMealInput>) { return toWeeklyPlan(await this.request(() => (this.apiClient as unknown as Client).PATCH(`/api/planned-meals/${plannedMealId}`, { params: { path: { plannedMealId } }, body: toUpdatePlannedMealRequest(input) }))); }
  private async request(request: () => Promise<Result>) {
    try { const result = await request(); if (result.error !== undefined) throw normalizeApiError(result.error, result.response); if (!result.data) throw new ApiClientError('unknown', 'La API no devolvio el plan semanal.'); return result.data; } catch (error) { throw normalizeApiError(error); }
  }
}
