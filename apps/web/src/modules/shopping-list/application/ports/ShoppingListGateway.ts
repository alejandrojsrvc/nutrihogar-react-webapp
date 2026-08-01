import type { Purchase, PurchaseInput } from '../../../purchases/application/ports/PurchaseGateway';
import type { ShoppingListItem, ShoppingListResult, ShoppingListSource } from '../../domain/ShoppingList';

export interface ShoppingListItemInput {
  foodId?: string;
  name: string;
  quantity: number;
  unit: string;
  source?: ShoppingListSource;
  sourceReferenceId?: string;
}

export interface ShoppingListGateway {
  get(householdId: string): Promise<ShoppingListResult>;
  add(householdId: string, input: ShoppingListItemInput): Promise<ShoppingListItem>;
  update(itemId: string, input: Partial<ShoppingListItemInput>): Promise<void>;
  remove(itemId: string): Promise<void>;
  markPurchased(itemId: string): Promise<void>;
  generateFromInventory(householdId: string): Promise<ShoppingListResult>;
  convertToPurchase(householdId: string, input: PurchaseInput & { itemIds: string[]; idempotencyKey?: string }): Promise<Purchase>;
}
