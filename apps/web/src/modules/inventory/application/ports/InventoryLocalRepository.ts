import type { InventoryItem } from '../../domain/Inventory';

export type InventoryOperationType = 'MOVEMENT' | 'ABSOLUTE_ADJUSTMENT';
export type InventoryOperationMovement = 'PURCHASE' | 'CONSUMPTION' | 'WASTE' | 'REMAINDER_RETURN';

export interface PendingInventoryOperation {
  operationId: string;
  type: InventoryOperationType;
  inventoryItemId: string;
  movementType?: InventoryOperationMovement;
  quantity?: number;
  newQuantity?: number;
  unit: string;
  occurredAt: string;
  baseVersion: number;
  allowLastWriteWins: boolean;
}

export interface InventoryLocalRepository {
  getSnapshot(householdId: string): Promise<InventoryItem[] | null>;
  saveSnapshot(householdId: string, items: InventoryItem[]): Promise<void>;
  saveOperation(householdId: string, operation: PendingInventoryOperation): Promise<void>;
  listPendingOperations(householdId: string): Promise<PendingInventoryOperation[]>;
  markOperationsSynchronized(operationIds: string[]): Promise<void>;
}
