import type { Purchase, PurchaseItem } from '../../domain/Purchase';

export function toPurchase(value: unknown): Purchase {
  const source = record(value);
  return {
    createdAt: stringValue(source.createdAt),
    currency: stringValue(source.currency, 'ARS'),
    householdId: stringValue(source.householdId),
    id: stringValue(source.id),
    items: arrayValue(source.items).map(toPurchaseItem),
    purchaseDate: stringValue(source.purchaseDate),
    status: purchaseStatus(source.status),
    storeName: stringValue(source.storeName),
    total: numberValue(source.total),
    updatedAt: stringValue(source.updatedAt),
  };
}

export function toPurchaseItem(value: unknown): PurchaseItem {
  const source = record(value);
  return {
    foodId: nullableString(source.foodId),
    id: nullableString(source.id),
    inventoryItemId: nullableString(source.inventoryItemId),
    nameSnapshot: stringValue(source.nameSnapshot, 'Producto'),
    quantity: numberValue(source.quantity),
    sourceShoppingItemId: nullableString(source.sourceShoppingItemId),
    unit: stringValue(source.unit, 'UNIT'),
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
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

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

function purchaseStatus(value: unknown): Purchase['status'] {
  return value === 'CONFIRMED' || value === 'CANCELLED' ? value : 'DRAFT';
}
