import Dexie, { type Table } from 'dexie';

import type { InventoryItem } from '../../domain/Inventory';
import {
  type InventoryLocalRepository,
  type InventoryOperationSyncStatus,
  type InventorySyncResultRecord,
  type PendingInventoryOperation,
} from '../../application/ports/InventoryLocalRepository';
import { getInventoryDeviceId } from './InventoryDeviceId';

interface SnapshotRow {
  householdId: string;
  items: InventoryItem[];
  updatedAt: string;
}

interface OperationRow extends PendingInventoryOperation {
  householdId: string;
  deviceId: string;
  createdAt: string;
  syncStatus: InventoryOperationSyncStatus;
  retryCount: number;
  lastError: string | null;
}

interface SyncResultRow extends InventorySyncResultRecord {
  id?: number;
}

interface MetadataRow {
  id?: number;
  householdId: string;
  key: string;
  value: string;
}

class InventoryDatabase extends Dexie {
  inventorySnapshots!: Table<SnapshotRow, string>;
  pendingInventoryOperations!: Table<OperationRow, string>;
  inventorySyncResults!: Table<SyncResultRow, number>;
  metadata!: Table<MetadataRow, number>;

  constructor() {
    super('nutrihogar-inventory');
    this.version(1).stores({
      operations: 'operationId, householdId',
      snapshots: 'householdId',
    });
    this.version(2).stores({
      inventorySnapshots: 'householdId',
      pendingInventoryOperations: 'operationId, householdId, syncStatus',
      inventorySyncResults: '++id, householdId, operationId, status',
      metadata: '++id, [householdId+key], householdId',
      operations: 'operationId, householdId',
      snapshots: 'householdId',
    }).upgrade(async (transaction) => {
      const oldSnapshots = await transaction.table('snapshots').toArray() as SnapshotRow[];
      const oldOperations = await transaction.table('operations').toArray() as Array<OperationRow & { householdId: string }>;
      if (oldSnapshots.length) await transaction.table('inventorySnapshots').bulkPut(oldSnapshots);
      if (oldOperations.length) {
        await transaction.table('pendingInventoryOperations').bulkPut(oldOperations.map((operation) => normalizeOperation(operation)));
      }
    });
  }
}

const database = new InventoryDatabase();

export class DexieInventoryLocalRepository implements InventoryLocalRepository {
  getSnapshot(householdId: string) {
    return database.inventorySnapshots.get(householdId).then((row) => row?.items ?? null);
  }

  async saveSnapshot(householdId: string, items: InventoryItem[]) {
    await database.inventorySnapshots.put({ householdId, items, updatedAt: new Date().toISOString() });
  }

  async saveOperation(householdId: string, operation: PendingInventoryOperation) {
    await database.pendingInventoryOperations.put(normalizeOperation({ ...operation, householdId }));
  }

  async saveOperationAndSnapshot(householdId: string, operation: PendingInventoryOperation, items: InventoryItem[]) {
    await database.transaction('rw', database.pendingInventoryOperations, database.inventorySnapshots, async () => {
      await database.pendingInventoryOperations.put(normalizeOperation({ ...operation, householdId }));
      await database.inventorySnapshots.put({ householdId, items, updatedAt: new Date().toISOString() });
    });
  }

  async listPendingOperations(householdId: string) {
    const operations = await database.pendingInventoryOperations.where('householdId').equals(householdId).toArray();
    return operations.filter((operation) => operation.syncStatus === 'PENDING' || operation.syncStatus === 'FAILED');
  }

  async markOperationsSynchronized(operationIds: string[]) {
    await database.transaction('rw', database.pendingInventoryOperations, async () => {
      for (const operationId of operationIds) {
        const operation = await database.pendingInventoryOperations.get(operationId);
        if (operation) await database.pendingInventoryOperations.put({ ...operation, syncStatus: 'APPLIED', lastError: null });
      }
    });
  }

  async markOperationsSyncing(operationIds: string[]) {
    for (const operationId of operationIds) {
      const operation = await database.pendingInventoryOperations.get(operationId);
      if (operation) await database.pendingInventoryOperations.put({ ...operation, syncStatus: 'SYNCING' });
    }
  }

  async markOperationsConflicted(operationIds: string[], detailsById: Record<string, { reason: string | null; conflictCode: string | null; retryable: boolean; resultingVersion: number | null }>) {
    for (const operationId of operationIds) {
      const operation = await database.pendingInventoryOperations.get(operationId);
      const details = detailsById[operationId];
      if (operation) await database.pendingInventoryOperations.put({ ...operation, conflictCode: details?.conflictCode ?? null, lastError: details?.reason ?? 'Conflicto de sincronización', resultingVersion: details?.resultingVersion ?? null, retryable: details?.retryable ?? false, syncStatus: 'CONFLICT' });
    }
  }

  async retryOperation(operationId: string, baseVersion: number) {
    const operation = await database.pendingInventoryOperations.get(operationId);
    if (operation) await database.pendingInventoryOperations.put({ ...operation, baseVersion, conflictCode: null, lastError: null, retryable: false, syncStatus: 'PENDING' });
  }

  async markOperationsFailed(operationIds: string[], error: string) {
    for (const operationId of operationIds) {
      const operation = await database.pendingInventoryOperations.get(operationId);
      if (operation) await database.pendingInventoryOperations.put({ ...operation, retryCount: operation.retryCount + 1, syncStatus: 'FAILED', lastError: error });
    }
  }

  async saveSyncResults(results: InventorySyncResultRecord[]) {
    await database.inventorySyncResults.bulkAdd(results);
    for (const result of results) {
      await database.metadata.put({ householdId: result.householdId, key: 'lastSyncAt', value: result.createdAt });
    }
  }

  async listConflictOperations(householdId: string) {
    const operations = await database.pendingInventoryOperations.where('householdId').equals(householdId).toArray();
    return operations.filter((operation) => operation.syncStatus === 'CONFLICT');
  }

  async discardOperation(operationId: string) {
    const operation = await database.pendingInventoryOperations.get(operationId);
    if (operation) await database.pendingInventoryOperations.put({ ...operation, syncStatus: 'FAILED', lastError: 'Operación descartada por la persona usuaria' });
  }

  async getLastSyncAt(householdId: string) {
    const rows = await database.metadata.where({ householdId, key: 'lastSyncAt' }).toArray();
    return rows[0]?.value ?? null;
  }
}

function normalizeOperation(operation: Partial<OperationRow> & { householdId: string }): OperationRow {
  return {
    allowLastWriteWins: operation.allowLastWriteWins ?? false,
    baseVersion: operation.baseVersion ?? 0,
    createdAt: operation.createdAt ?? new Date().toISOString(),
    conflictCode: operation.conflictCode ?? null,
    deviceId: operation.deviceId ?? getInventoryDeviceId(),
    householdId: operation.householdId,
    inventoryItemId: operation.inventoryItemId ?? '',
    lastError: operation.lastError ?? null,
    movementType: operation.movementType,
    newQuantity: operation.newQuantity,
    occurredAt: operation.occurredAt ?? new Date().toISOString(),
    operationId: operation.operationId ?? crypto.randomUUID(),
    payload: operation.payload,
    quantity: operation.quantity,
    retryCount: operation.retryCount ?? 0,
    retryable: operation.retryable ?? false,
    resultingVersion: operation.resultingVersion ?? null,
    syncStatus: operation.syncStatus ?? 'PENDING',
    type: operation.type ?? 'MOVEMENT',
    unit: operation.unit ?? 'UNIT',
  };
}
