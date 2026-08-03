import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';
import type {
  PreparedBatchGateway,
  PreparedBatchIngredientInput,
} from '../../application/ports/PreparedBatchGateway';
import {
  toPreparedBatch,
  toPreparedBatchDetails,
} from '../mappers/PreparedBatchApiMapper';
type Result = { data?: unknown; error?: unknown; response?: Response };
interface Client {
  GET(
    path: string,
    options: { params: { path: Record<string, string> } },
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
}
export class HttpPreparedBatchGateway implements PreparedBatchGateway {
  constructor(private readonly apiClient: ApiClient) {}
  async startFromRecipe(recipeId: string, preparedAt: Date) {
    return this.mutate(
      () =>
        (this.apiClient as unknown as Client).POST(
          `/api/recipes/${recipeId}/prepared-batches`,
          {
            params: { path: { recipeId } },
            body: { preparedAt: preparedAt.toISOString() },
          },
        ),
      toPreparedBatch,
    );
  }
  async getById(batchId: string) {
    return this.mutate(
      () =>
        (this.apiClient as unknown as Client).GET(
          `/api/prepared-batches/${batchId}`,
          { params: { path: { batchId } } },
        ),
      toPreparedBatch,
    );
  }
  async getDetails(batchId: string) {
    return this.mutate(
      () =>
        (this.apiClient as unknown as Client).GET(
          `/api/prepared-batches/${batchId}/details`,
          { params: { path: { batchId } } },
        ),
      toPreparedBatchDetails,
    );
  }
  async updateIngredients(
    batchId: string,
    ingredients: PreparedBatchIngredientInput[],
  ) {
    return this.mutate(
      () =>
        (this.apiClient as unknown as Client).PATCH(
          `/api/prepared-batches/${batchId}/ingredients`,
          { params: { path: { batchId } }, body: { ingredients } },
        ),
      toPreparedBatch,
    );
  }
  async confirmIngredients(batchId: string) {
    return this.mutate(
      () =>
        (this.apiClient as unknown as Client).POST(
          `/api/prepared-batches/${batchId}/confirm-ingredients`,
          { params: { path: { batchId } } },
        ),
      toPreparedBatch,
    );
  }
  async finalize(batchId: string, finalCookedWeight: number) {
    return this.mutate(
      () =>
        (this.apiClient as unknown as Client).POST(
          `/api/prepared-batches/${batchId}/finalize`,
          {
            params: { path: { batchId } },
            body: { finalCookedWeight, unit: 'GRAM' },
          },
        ),
      toPreparedBatch,
    );
  }
  async cancel(batchId: string) {
    const result = await (this.apiClient as unknown as Client).DELETE(
      `/api/prepared-batches/${batchId}`,
      { params: { path: { batchId } } },
    );
    if (result.error !== undefined)
      throw normalizeApiError(result.error, result.response);
  }
  private async mutate<T>(
    request: () => Promise<Result>,
    mapper: (value: unknown) => T,
  ): Promise<T> {
    try {
      const result = await request();
      if (result.error !== undefined)
        throw normalizeApiError(result.error, result.response);
      if (result.data === undefined)
        throw new ApiClientError(
          'unknown',
          'La API no devolvió la preparación.',
        );
      return mapper(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
