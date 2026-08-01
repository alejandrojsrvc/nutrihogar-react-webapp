import Dexie, { type Table } from 'dexie';

import type { InventoryItem } from '../../domain/Inventory';
import type {
  InventoryLocalRepository,
  PendingInventoryOperation,
} from '../../application/ports/InventoryLocalRepository';

interface SnapshotRow {
  householdId: string;
  items: InventoryItem[];
  updatedAt: string;
}

interface OperationRow extends PendingInventoryOperation {
  householdId: string;
}

class InventoryDatabase extends Dexie {
  snapshots!: Table<SnapshotRow, string>;
  operations!: Table<OperationRow, string>;

  constructor() {
    super('nutrihogar-inventory');
    this.version(1).stores({
      operations: 'operationId, householdId',
      snapshots: 'householdId',
    });
  }
}

const database = new InventoryDatabase();

export class DexieInventoryLocalRepository implements InventoryLocalRepository {
  getSnapshot(householdId: string) {
    return database.snapshots.get(householdId).then((row) => row?.items ?? null);
  }

  async saveSnapshot(householdId: string, items: InventoryItem[]) {
    await database.snapshots.put({ householdId, items, updatedAt: new Date().toISOString() });
  }

  async saveOperation(householdId: string, operation: PendingInventoryOperation) {
    await database.operations.put({ ...operation, householdId });
  }

  async listPendingOperations(householdId: string) {
    return database.operations.where('householdId').equals(householdId).toArray();
  }

  async markOperationsSynchronized(operationIds: string[]) {
    await database.operations.bulkDelete(operationIds);
  }
}
