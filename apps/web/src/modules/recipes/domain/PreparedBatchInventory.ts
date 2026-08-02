export type PreparedBatchInventoryStatus = 'AVAILABLE' | 'INSUFFICIENT' | 'NO_INVENTORY' | 'IGNORED' | 'CONFIRMED';

export interface InventoryConsumptionOption {
  inventoryItemId: string;
  name: string;
  availableQuantity: number;
  unit: string;
  location: string | null;
}

export interface PreparedBatchInventoryIngredient {
  ingredientId: string;
  name: string;
  usedQuantity: number;
  unit: string;
  availableQuantity: number;
  status: PreparedBatchInventoryStatus;
  options: InventoryConsumptionOption[];
  selectedInventoryItemId: string | null;
}

export interface PreparedBatchInventoryPreview {
  batchId: string;
  ingredients: PreparedBatchInventoryIngredient[];
  alreadyConfirmed: boolean;
}

export interface PreparedBatchInventoryDecision {
  ingredientId: string;
  action: 'CONSUME' | 'IGNORE';
  inventoryItemId?: string;
}
