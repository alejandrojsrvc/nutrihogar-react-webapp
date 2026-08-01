import type { InventoryItem } from '../../domain/Inventory';
import type { PendingInventoryOperation } from './InventoryLocalRepository';

export interface InventorySyncConflict {
  operationId: string;
  reason: string | null;
  snapshot: InventoryItem | null;
}

export interface InventorySyncResult {
  processed: string[];
  conflicts: InventorySyncConflict[];
  snapshot: InventoryItem | null;
}

export interface InventorySyncGateway {
  synchronize(
    householdId: string,
    deviceId: string,
    operations: PendingInventoryOperation[],
  ): Promise<InventorySyncResult>;
}
