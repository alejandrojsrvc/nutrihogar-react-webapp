import { describe, expect, it } from 'vitest';

import { toInventoryItem, toInventoryMovement } from './InventoryApiMapper';

describe('InventoryApiMapper', () => {
  it('maps an inventory item and nullable metadata', () => {
    expect(
      toInventoryItem({
        id: 'item-1',
        name: 'Arroz',
        currentQuantity: 500,
        unit: 'GRAM',
        itemType: 'FOOD',
        status: 'ACTIVE',
        version: 1,
      }),
    ).toMatchObject({
      currentQuantity: 500,
      foodId: null,
      minimumQuantity: null,
      name: 'Arroz',
    });
  });

  it('maps movement provenance', () => {
    expect(
      toInventoryMovement({
        id: 'movement-1',
        inventoryItemId: 'item-1',
        type: 'CONSUMPTION',
        quantity: 100,
        unit: 'GRAM',
        sourceType: 'MEAL',
        sourceId: 'meal-1',
      }),
    ).toMatchObject({ quantity: 100, sourceId: 'meal-1', type: 'CONSUMPTION' });
  });
});
