export type ShoppingListSource =
  'MANUAL' | 'BELOW_MINIMUM' | 'DEPLETED' | 'MEAL_PLAN';

export interface ShoppingListItem {
  id: string;
  householdId: string;
  foodId: string | null;
  name: string;
  quantity: number;
  unit: string;
  source: ShoppingListSource;
  sourceReferenceId: string | null;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListResult {
  items: ShoppingListItem[];
}
