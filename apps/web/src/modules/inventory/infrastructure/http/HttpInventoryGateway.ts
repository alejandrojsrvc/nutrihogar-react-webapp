import { normalizeApiError, type ApiClient } from '@nutrihogar/api-client';

import type {
  AdjustInventoryItemInput,
  ConsumeInventoryItemInput,
  CreateManualInventoryItemInput,
  InventoryGateway,
} from '../../application/ports/InventoryGateway';
import type { InventoryFilters } from '../../domain/Inventory';
import { toInventoryItem, toInventoryMovement } from '../mappers/InventoryApiMapper';

type Result = { data?: unknown; error?: unknown; response?: Response };

interface Client {
  GET(path: string, options?: { params: { path: Record<string, string>; query?: InventoryFilters } }): Promise<Result>;
  POST(path: string, options: { params: { path: Record<string, string> }; body: unknown }): Promise<Result>;
  PATCH(path: string, options: { params: { path: Record<string, string> }; body: unknown }): Promise<Result>;
  DELETE(path: string, options: { params: { path: Record<string, string> } }): Promise<Result>;
}

export class HttpInventoryGateway implements InventoryGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async list(householdId: string, filters: InventoryFilters = {}) {
    const result = await this.request(() => (this.apiClient as unknown as Client).GET(
      `/api/households/${householdId}/inventory`,
      { params: { path: { householdId }, query: filters } },
    ));
    const source = record(result);
    const items = Array.isArray(source.items) ? source.items.map(toInventoryItem) : [];
    return { items, limit: Number(source.limit ?? items.length), page: Number(source.page ?? 1), total: Number(source.total ?? items.length) };
  }

  async getById(inventoryItemId: string) {
    return toInventoryItem(await this.request(() => (this.apiClient as unknown as Client).GET(
      `/api/inventory/items/${inventoryItemId}`,
      { params: { path: { inventoryItemId } } },
    )));
  }

  async create(householdId: string, input: CreateManualInventoryItemInput) {
    return toInventoryItem(await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/households/${householdId}/inventory/items`,
      { body: createBody(input), params: { path: { householdId } } },
    )));
  }

  async adjust(inventoryItemId: string, input: AdjustInventoryItemInput) {
    return toInventoryItem(await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/inventory/items/${inventoryItemId}/adjustments`,
      { body: { ...input, occurredAt: input.occurredAt?.toISOString() }, params: { path: { inventoryItemId } } },
    )));
  }

  async consume(inventoryItemId: string, input: ConsumeInventoryItemInput) {
    return toInventoryItem(await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/inventory/items/${inventoryItemId}/consumptions`,
      { body: { ...input, occurredAt: input.occurredAt?.toISOString() }, params: { path: { inventoryItemId } } },
    )));
  }

  async archive(inventoryItemId: string) {
    await this.request(() => (this.apiClient as unknown as Client).DELETE(
      `/api/inventory/items/${inventoryItemId}`,
      { params: { path: { inventoryItemId } } },
    ));
  }

  async listMovements(inventoryItemId: string) {
    const result = await this.request(() => (this.apiClient as unknown as Client).GET(
      `/api/inventory/items/${inventoryItemId}/movements`,
      { params: { path: { inventoryItemId } } },
    ));
    const source = record(result);
    return Array.isArray(source.items) ? source.items.map(toInventoryMovement) : [];
  }

  private async request(request: () => Promise<Result>) {
    try {
      const result = await request();
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      return result.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function createBody(input: CreateManualInventoryItemInput) {
  return {
    ...input,
    expiresAt: input.expiresAt?.toISOString(),
    occurredAt: input.occurredAt?.toISOString(),
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
