export type PreparedBatchInventoryAvailability =
  'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
export type PreparedBatchInventoryStatus =
  PreparedBatchInventoryAvailability | 'IGNORED' | 'CONFIRMED';

export interface InventoryConsumptionOption {
  inventoryItemId: string;
  foodId: string | null;
  availableQuantity: number;
  unit: string;
  location: string | null;
  expiresAt: string | null;
  status: string;
}

export interface PreparedBatchInventoryIngredient {
  ingredientId: string;
  name: string;
  usedQuantity: number;
  unit: string;
  availableQuantity: number;
  availability: PreparedBatchInventoryAvailability;
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
