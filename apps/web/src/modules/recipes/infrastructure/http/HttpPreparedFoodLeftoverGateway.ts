import { normalizeApiError, type ApiClient } from '@nutrihogar/api-client';

import type {
  CreatePreparedFoodLeftoverInput,
  AddPreparedFoodLeftoverToInventoryInput,
  PreparedFoodLeftoverGateway,
  PreparedFoodLeftoverStatus,
} from '../../application/ports/PreparedFoodLeftoverGateway';
import type { PreparedFoodLeftover } from '../../domain/PreparedBatch';
import { toLeftover } from '../mappers/PreparedBatchApiMapper';
import { toInventoryItem } from '../../../inventory/infrastructure/mappers/InventoryApiMapper';

type Result = { data?: unknown; error?: unknown; response?: Response };

interface Client {
  GET(path: string, options: { params: { path: Record<string, string> } }): Promise<Result>;
  POST(path: string, options: { params: { path: Record<string, string> }; body: unknown }): Promise<Result>;
  PATCH(path: string, options: { params: { path: Record<string, string> }; body: unknown }): Promise<Result>;
}

export class HttpPreparedFoodLeftoverGateway implements PreparedFoodLeftoverGateway {
  constructor(private readonly apiClient: ApiClient) {}

  create(batchId: string, input: CreatePreparedFoodLeftoverInput) {
    return this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/prepared-batches/${batchId}/leftovers`,
      {
        body: {
          notes: input.notes,
          storageLocation: input.storageLocation,
          storedAt: input.storedAt.toISOString(),
          weight: input.weight,
        },
        params: { path: { batchId } },
      },
    ));
  }

  list(householdId: string) {
    return this.requestList(() => (this.apiClient as unknown as Client).GET(
      `/api/households/${householdId}/prepared-leftovers`,
      { params: { path: { householdId } } },
    ));
  }

  getById(leftoverId: string) {
    return this.request(() => (this.apiClient as unknown as Client).GET(
      `/api/prepared-leftovers/${leftoverId}`,
      { params: { path: { leftoverId } } },
    ));
  }

  async addToInventory(leftoverId: string, input: AddPreparedFoodLeftoverToInventoryInput) {
    const result = await this.requestRaw(() => (this.apiClient as unknown as Client).POST(
      `/api/prepared-leftovers/${leftoverId}/add-to-inventory`,
      { params: { path: { leftoverId } }, body: { expiresAt: input.expiresAt?.toISOString() ?? null, location: input.location ?? null, quantity: input.quantity } },
    ));
    return toInventoryItem(result);
  }

  updateStatus(leftoverId: string, status: PreparedFoodLeftoverStatus) {
    return this.request(() => (this.apiClient as unknown as Client).PATCH(
      `/api/prepared-leftovers/${leftoverId}/status`,
      { body: { status }, params: { path: { leftoverId } } },
    ));
  }

  private async request(request: () => Promise<Result>): Promise<PreparedFoodLeftover> {
    try {
      const result = await request();
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      return toLeftover(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  private async requestList(request: () => Promise<Result>): Promise<PreparedFoodLeftover[]> {
    try {
      const result = await request();
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      return Array.isArray(result.data) ? result.data.map(toLeftover) : [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  private async requestRaw(request: () => Promise<Result>) {
    try {
      const result = await request();
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      return result.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
