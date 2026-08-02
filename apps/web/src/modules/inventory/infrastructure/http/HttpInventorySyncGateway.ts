import { normalizeApiError, type ApiClient, type components } from '@nutrihogar/api-client';

import type { InventorySyncConflict, InventorySyncGateway } from '../../application/ports/InventorySyncGateway';
import type { PendingInventoryOperation } from '../../application/ports/InventoryLocalRepository';
import { toInventoryItem } from '../mappers/InventoryApiMapper';

type Result<T = unknown> = { data?: T; error?: unknown; response?: Response };
type SyncRequest = components['schemas']['InventorySyncRequestDto'];
type SyncResponse = components['schemas']['InventorySyncResponseDto'];
interface Client { POST(path: string, options: { params: { path: { householdId: string } }; body: SyncRequest }): Promise<Result<SyncResponse>>; }

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
        return { conflictCode: conflict.conflictCode == null ? null : String(conflict.conflictCode) as InventorySyncConflict['conflictCode'], operationId: String(conflict.operationId ?? ''), reason: conflict.reason == null ? null : String(conflict.reason), resultingVersion: conflict.resultingVersion == null ? null : Number(conflict.resultingVersion), retryable: Boolean(conflict.retryable), snapshot: conflict.snapshot ? toInventoryItem(conflict.snapshot) : null };
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
