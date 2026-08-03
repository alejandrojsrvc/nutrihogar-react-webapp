import type { PreparedFoodLeftover } from '../../domain/PreparedBatch';
import type { InventoryItem } from '../../../inventory/domain/Inventory';

export type PreparedFoodLeftoverStatus = 'CONSUMED' | 'DISCARDED' | 'EXPIRED';

export interface CreatePreparedFoodLeftoverInput {
  weight: number;
  storedAt: Date;
  storageLocation?: string;
  notes?: string;
}

export interface AddPreparedFoodLeftoverToInventoryInput {
  quantity: number;
  location?: string | null;
  expiresAt?: Date | null;
}

export interface PreparedFoodLeftoverGateway {
  create(
    batchId: string,
    input: CreatePreparedFoodLeftoverInput,
  ): Promise<PreparedFoodLeftover>;
  list(householdId: string): Promise<PreparedFoodLeftover[]>;
  getById(leftoverId: string): Promise<PreparedFoodLeftover>;
  addToInventory(
    leftoverId: string,
    input: AddPreparedFoodLeftoverToInventoryInput,
  ): Promise<InventoryItem>;
  updateStatus(
    leftoverId: string,
    status: PreparedFoodLeftoverStatus,
  ): Promise<PreparedFoodLeftover>;
}
