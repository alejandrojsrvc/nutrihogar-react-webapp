export type PurchaseStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface PurchaseItem {
  id: string | null;
  foodId: string | null;
  inventoryItemId: string | null;
  sourceShoppingItemId: string | null;
  nameSnapshot: string;
  unit: string;
  quantity: number;
}

export interface Purchase {
  id: string;
  householdId: string;
  storeName: string;
  purchaseDate: string;
  total: number;
  currency: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseListResult {
  items: Purchase[];
  page: number;
  limit: number;
  total: number;
}
