import type { InventoryItem, InventoryUnit } from '../../domain/Inventory';

export type InventoryOperationType = 'MOVEMENT' | 'ABSOLUTE_ADJUSTMENT';
export type InventoryOperationMovement =
  'PURCHASE' | 'CONSUMPTION' | 'WASTE' | 'EXPIRATION' | 'REMAINDER_RETURN';
export type InventoryOperationSyncStatus =
  'PENDING' | 'SYNCING' | 'APPLIED' | 'CONFLICT' | 'FAILED';

export interface PendingInventoryOperation {
  operationId: string;
  type: InventoryOperationType;
  inventoryItemId: string;
  movementType?: InventoryOperationMovement;
  quantity?: number;
  newQuantity?: number;
  unit: InventoryUnit;
  occurredAt: string;
  baseVersion: number;
  allowLastWriteWins: boolean;
  deviceId?: string;
  payload?: Record<string, unknown>;
  snapshot?: InventoryItem | null;
  discarded?: boolean;
  createdAt?: string;
  syncStatus?: InventoryOperationSyncStatus;
  retryCount?: number;
  lastError?: string | null;
  conflictCode?: string | null;
  retryable?: boolean;
  resultingVersion?: number | null;
}

export interface InventorySyncResultRecord {
  operationId: string;
  householdId: string;
  status: 'APPLIED' | 'CONFLICT' | 'FAILED';
  reason: string | null;
  createdAt: string;
}

export interface InventoryLocalRepository {
  getSnapshot(householdId: string): Promise<InventoryItem[] | null>;
  getSnapshotForItem?(inventoryItemId: string): Promise<InventoryItem | null>;
  saveSnapshot(householdId: string, items: InventoryItem[]): Promise<void>;
  saveOperation(
    householdId: string,
    operation: PendingInventoryOperation,
  ): Promise<void>;
  listPendingOperations(
    householdId: string,
  ): Promise<PendingInventoryOperation[]>;
  markOperationsSynchronized(operationIds: string[]): Promise<void>;
  saveOperationSnapshots?(
    snapshotsById: Record<string, InventoryItem>,
  ): Promise<void>;
  markOperationsSyncing?(operationIds: string[]): Promise<void>;
  recoverSyncingOperations?(householdId: string): Promise<void>;
  saveOperationAndSnapshot?(
    householdId: string,
    operation: PendingInventoryOperation,
    items: InventoryItem[],
  ): Promise<void>;
  markOperationsConflicted?(
    operationIds: string[],
    detailsById: Record<
      string,
      {
        reason: string | null;
        conflictCode: string | null;
        retryable: boolean;
        resultingVersion: number | null;
        snapshot?: InventoryItem | null;
      }
    >,
  ): Promise<void>;
  markOperationsFailed?(operationIds: string[], error: string): Promise<void>;
  saveSyncResults?(results: InventorySyncResultRecord[]): Promise<void>;
  listConflictOperations?(
    householdId: string,
  ): Promise<PendingInventoryOperation[]>;
  discardOperation?(operationId: string): Promise<void>;
  retryOperation?(operationId: string, baseVersion: number): Promise<void>;
  getLastSyncAt?(householdId: string): Promise<string | null>;
}
