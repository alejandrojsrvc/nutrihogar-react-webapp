import { ApiClientError, normalizeApiError, type ApiClient } from '@nutrihogar/api-client';
import type { CreateRecipeInput, RecipeGateway, RecipeListCriteria, RecipeListResult, UpdateRecipeInput } from '../../application/ports/RecipeGateway';
import type { Recipe } from '../../domain/Recipe';
import { toRecipe } from '../mappers/RecipeApiMapper';

type ApiResult<T> = { data?: T; error?: unknown; response?: Response };

interface RecipeApiClient {
  GET(path: string, options: { params: { path: { householdId?: string; recipeId?: string }; query?: Record<string, unknown> } }): Promise<ApiResult<unknown>>;
  POST(path: string, options: { params: { path: { householdId: string } }; body: unknown }): Promise<ApiResult<unknown>>;
  PATCH(path: string, options: { params: { path: { recipeId: string } }; body: unknown }): Promise<ApiResult<unknown>>;
}

export class HttpRecipeGateway implements RecipeGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async create(householdId: string, input: CreateRecipeInput): Promise<Recipe> {
    return this.request(() => (this.apiClient as unknown as RecipeApiClient).POST(`/api/households/${householdId}/recipes`, { params: { path: { householdId } }, body: input }), 'crear');
  }

  async update(recipeId: string, input: UpdateRecipeInput): Promise<Recipe> {
    return this.request(() => (this.apiClient as unknown as RecipeApiClient).PATCH(`/api/recipes/${recipeId}`, { params: { path: { recipeId } }, body: input }), 'actualizar');
  }

  async getById(recipeId: string): Promise<Recipe> {
    return this.request(() => (this.apiClient as unknown as RecipeApiClient).GET(`/api/recipes/${recipeId}`, { params: { path: { recipeId } } }), 'cargar');
  }

  async list(householdId: string, criteria: RecipeListCriteria): Promise<RecipeListResult> {
    try {
      const result = await (this.apiClient as unknown as RecipeApiClient).GET(`/api/households/${householdId}/recipes`, { params: { path: { householdId }, query: { category: criteria.category || undefined, limit: criteria.limit, page: criteria.page, query: criteria.query || undefined, status: criteria.status || undefined } } });
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      const source = result.data as Record<string, unknown> | undefined;
      if (!source) throw new ApiClientError('unknown', 'La API no devolvio las recetas.');
      return { items: Array.isArray(source.items) ? source.items.map(toRecipe) : [], limit: Number(source.limit ?? criteria.limit), page: Number(source.page ?? criteria.page), total: Number(source.total ?? 0) };
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  private async request(request: () => Promise<ApiResult<unknown>>, action: string): Promise<Recipe> {
    try {
      const result = await request();
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      if (!result.data) throw new ApiClientError('unknown', `La API no devolvio la receta al ${action}la.`);
      return toRecipe(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
