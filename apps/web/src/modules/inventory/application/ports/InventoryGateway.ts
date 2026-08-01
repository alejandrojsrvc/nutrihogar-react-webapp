import type {
  InventoryFilters,
  InventoryItem,
  InventoryListResult,
  InventoryMovement,
  InventoryUnit,
} from '../../domain/Inventory';

export interface CreateManualInventoryItemInput {
  foodId: string;
  quantity: number;
  unit: InventoryUnit;
  minimumQuantity?: number | null;
  location?: string | null;
  expiresAt?: Date | null;
  reason?: string;
  occurredAt?: Date;
}

export interface AdjustInventoryItemInput {
  quantity: number;
  unit: InventoryUnit;
  reason: string;
  occurredAt?: Date;
}

export interface ConsumeInventoryItemInput {
  quantity: number;
  unit: InventoryUnit;
  reason?: string;
  occurredAt?: Date;
}

export interface InventoryGateway {
  list(householdId: string, filters?: InventoryFilters): Promise<InventoryListResult>;
  getById(inventoryItemId: string): Promise<InventoryItem>;
  create(householdId: string, input: CreateManualInventoryItemInput): Promise<InventoryItem>;
  adjust(inventoryItemId: string, input: AdjustInventoryItemInput): Promise<InventoryItem>;
  consume(inventoryItemId: string, input: ConsumeInventoryItemInput): Promise<InventoryItem>;
  archive(inventoryItemId: string): Promise<void>;
  listMovements(inventoryItemId: string): Promise<InventoryMovement[]>;
}
