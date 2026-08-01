export type InventoryItemType = 'FOOD' | 'PREPARED_FOOD' | 'CUSTOM';
export type InventoryItemStatus = 'ACTIVE' | 'DEPLETED' | 'ARCHIVED';
export type InventoryUnit = 'GRAM' | 'MILLILITER' | 'UNIT';
export type InventoryMovementType =
  | 'PURCHASE'
  | 'CONSUMPTION'
  | 'ADJUSTMENT_INCREASE'
  | 'ADJUSTMENT_DECREASE'
  | 'WASTE'
  | 'EXPIRATION'
  | 'PREPARATION_CONSUMPTION'
  | 'REMAINDER_RETURN'
  | 'MANUAL_ENTRY';

export interface InventoryItem {
  id: string;
  householdId: string;
  foodId: string | null;
  preparedFoodLeftoverId: string | null;
  name: string;
  itemType: InventoryItemType;
  currentQuantity: number;
  unit: InventoryUnit;
  minimumQuantity: number | null;
  location: string | null;
  expiresAt: string | null;
  status: InventoryItemStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  type: InventoryMovementType;
  quantity: number;
  unit: InventoryUnit;
  occurredAt: string;
  sourceType: string | null;
  sourceId: string | null;
  reason: string | null;
  actorId: string | null;
  createdAt: string;
}

export interface InventoryListResult {
  items: InventoryItem[];
  page: number;
  limit: number;
  total: number;
}

export interface InventoryFilters {
  query?: string;
  itemType?: InventoryItemType;
  status?: InventoryItemStatus;
  location?: string;
  belowMinimum?: boolean;
  expiresBefore?: string;
  page?: number;
  limit?: number;
}
