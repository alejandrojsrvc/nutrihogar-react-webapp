import { normalizeApiError, type ApiClient } from '@nutrihogar/api-client';

import type { InventorySyncGateway } from '../../application/ports/InventorySyncGateway';
import type { PendingInventoryOperation } from '../../application/ports/InventoryLocalRepository';
import { toInventoryItem } from '../mappers/InventoryApiMapper';

type Result = { data?: unknown; error?: unknown; response?: Response };
interface Client { POST(path: string, options: { params: { path: { householdId: string } }; body: unknown }): Promise<Result>; }

export class HttpInventorySyncGateway implements InventorySyncGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async synchronize(householdId: string, deviceId: string, operations: PendingInventoryOperation[]) {
    try {
      const result = await (this.apiClient as unknown as Client).POST(
        `/api/households/${householdId}/inventory/sync`,
        { body: { deviceId, operations }, params: { path: { householdId } } },
      );
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      const source = record(result.data);
      const processed = Array.isArray(source.processed) ? source.processed.map((item) => String(record(item).operationId)) : [];
      const conflicts = Array.isArray(source.conflicts) ? source.conflicts.map((item) => {
        const conflict = record(item);
        return { operationId: String(conflict.operationId ?? ''), reason: conflict.reason == null ? null : String(conflict.reason), snapshot: conflict.snapshot ? toInventoryItem(conflict.snapshot) : null };
      }) : [];
      return { conflicts, processed, snapshot: source.snapshot ? toInventoryItem(source.snapshot) : null };
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
