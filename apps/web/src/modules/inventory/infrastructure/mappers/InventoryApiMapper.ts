import type { InventoryItem, InventoryMovement } from '../../domain/Inventory';

export function toInventoryItem(value: unknown): InventoryItem {
  const source = record(value);
  return {
    createdAt: String(source.createdAt ?? ''),
    currentQuantity: Number(source.currentQuantity ?? 0),
    expiresAt: nullableString(source.expiresAt),
    foodId: nullableString(source.foodId),
    householdId: String(source.householdId ?? ''),
    id: String(source.id ?? ''),
    itemType: String(source.itemType ?? 'FOOD') as InventoryItem['itemType'],
    location: nullableString(source.location),
    minimumQuantity: nullableNumber(source.minimumQuantity),
    name: String(source.name ?? 'Existencia'),
    preparedFoodLeftoverId: nullableString(source.preparedFoodLeftoverId),
    status: String(source.status ?? 'ACTIVE') as InventoryItem['status'],
    unit: String(source.unit ?? 'GRAM') as InventoryItem['unit'],
    updatedAt: String(source.updatedAt ?? ''),
    version: Number(source.version ?? 0),
  };
}

export function toInventoryMovement(value: unknown): InventoryMovement {
  const source = record(value);
  return {
    actorId: nullableString(source.actorId),
    createdAt: String(source.createdAt ?? ''),
    id: String(source.id ?? ''),
    inventoryItemId: String(source.inventoryItemId ?? ''),
    occurredAt: String(source.occurredAt ?? ''),
    quantity: Number(source.quantity ?? 0),
    reason: nullableString(source.reason),
    sourceId: nullableString(source.sourceId),
    sourceType: nullableString(source.sourceType),
    type: String(source.type ?? 'MANUAL_ENTRY') as InventoryMovement['type'],
    unit: String(source.unit ?? 'GRAM') as InventoryMovement['unit'],
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function nullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

function nullableNumber(value: unknown): number | null {
  return value == null ? null : Number(value);
}
