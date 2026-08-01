import type { Purchase, PurchaseListResult, PurchaseStatus } from '../../domain/Purchase';

export interface PurchaseInput {
  storeName: string;
  purchaseDate: Date;
  total: number;
  currency?: string;
  items: PurchaseItemInput[];
}

export interface PurchaseItemInput {
  foodId?: string;
  inventoryItemId?: string;
  sourceShoppingItemId?: string;
  nameSnapshot: string;
  unit: string;
  quantity: number;
}

export interface PurchaseFilters {
  status?: PurchaseStatus;
  page?: number;
  limit?: number;
  storeName?: string;
}

export interface PurchaseGateway {
  list(householdId: string, filters?: PurchaseFilters): Promise<PurchaseListResult>;
  getById(purchaseId: string): Promise<Purchase>;
  create(householdId: string, input: PurchaseInput): Promise<Purchase>;
  update(purchaseId: string, input: Partial<PurchaseInput>): Promise<Purchase>;
  confirm(purchaseId: string): Promise<Purchase>;
  cancel(purchaseId: string): Promise<void>;
}
