import type {
  InventoryFilters,
  InventoryItem,
  InventoryListResult,
  InventoryMovement,
  InventoryUnit,
} from '../../domain/Inventory';
import type { RegisteredMeal } from '../../../meals/application/ports/MealGateway';

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

export interface UpdateInventoryItemInput {
  minimumQuantity?: number | null;
  location?: string | null;
  expiresAt?: Date | null;
}

export interface ConsumeInventoryItemInput {
  quantity: number;
  unit: InventoryUnit;
  reason?: string;
  occurredAt?: Date;
}

export interface ConsumePreparedFoodInput {
  adultProfileId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER' | 'EXTRA';
  quantity: number;
  consumedAt: Date;
}

export interface InventoryGateway {
  list(
    householdId: string,
    filters?: InventoryFilters,
  ): Promise<InventoryListResult>;
  getById(inventoryItemId: string): Promise<InventoryItem>;
  create(
    householdId: string,
    input: CreateManualInventoryItemInput,
  ): Promise<InventoryItem>;
  adjust(
    inventoryItemId: string,
    input: AdjustInventoryItemInput,
  ): Promise<InventoryItem>;
  consume(
    inventoryItemId: string,
    input: ConsumeInventoryItemInput,
  ): Promise<InventoryItem>;
  waste(
    inventoryItemId: string,
    input: ConsumeInventoryItemInput,
  ): Promise<InventoryItem>;
  expire(
    inventoryItemId: string,
    input: ConsumeInventoryItemInput,
  ): Promise<InventoryItem>;
  consumePrepared(
    inventoryItemId: string,
    input: ConsumePreparedFoodInput,
  ): Promise<RegisteredMeal>;
  update(
    inventoryItemId: string,
    input: UpdateInventoryItemInput,
  ): Promise<InventoryItem>;
  archive(inventoryItemId: string): Promise<void>;
  listMovements(inventoryItemId: string): Promise<InventoryMovement[]>;
}
