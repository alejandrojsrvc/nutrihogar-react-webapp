import type { ShoppingListItem, ShoppingListResult, ShoppingListSource } from '../../domain/ShoppingList';

export function toShoppingList(value: unknown): ShoppingListResult {
  const source = record(value);
  return { items: arrayValue(source.items).map(toShoppingListItem) };
}

export function toShoppingListItem(value: unknown): ShoppingListItem {
  const source = record(value);
  return {
    createdAt: stringValue(source.createdAt),
    foodId: nullableString(source.foodId),
    householdId: stringValue(source.householdId),
    id: stringValue(source.id),
    name: stringValue(source.name, 'Producto'),
    purchased: Boolean(source.purchased) || source.status === 'PURCHASED',
    quantity: Number(source.quantity ?? 0),
    source: sourceValue(source.source),
    sourceReferenceId: nullableString(source.sourceReferenceId),
    unit: stringValue(source.unit, 'UNIT'),
    updatedAt: stringValue(source.updatedAt),
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown, fallback = '') {
  return value == null ? fallback : String(value);
}

function nullableString(value: unknown) {
  return value == null ? null : String(value);
}

function sourceValue(value: unknown): ShoppingListSource {
  return value === 'BELOW_MINIMUM' || value === 'DEPLETED' || value === 'MEAL_PLAN' ? value : 'MANUAL';
}
