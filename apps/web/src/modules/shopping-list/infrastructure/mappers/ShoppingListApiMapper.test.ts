import { describe, expect, it } from 'vitest';

import { toShoppingList } from './ShoppingListApiMapper';

describe('toShoppingList', () => {
  it('maps pending and purchased list items', () => {
    expect(
      toShoppingList({
        items: [
          {
            id: 'item-1',
            name: 'Leche',
            purchased: true,
            quantity: 2,
            source: 'MANUAL',
            unit: 'L',
          },
        ],
      }).items[0],
    ).toMatchObject({ name: 'Leche', purchased: true, source: 'MANUAL' });
  });
});
