import { describe, expect, it, vi } from 'vitest';

import type { ShoppingListGateway } from '../ports/ShoppingListGateway';
import { AddShoppingListItemUseCase, ConvertShoppingListToPurchaseUseCase } from './ShoppingListUseCases';

describe('ShoppingListUseCases', () => {
  it('rejects non-positive manual items', async () => {
    const gateway = { add: vi.fn() } as unknown as ShoppingListGateway;

    expect(() => new AddShoppingListItemUseCase(gateway).execute('household-1', { name: 'Arroz', quantity: 0, unit: 'kg' })).toThrow('mayor que cero');
    expect(gateway.add).not.toHaveBeenCalled();
  });

  it('requires selected items before converting to a purchase', async () => {
    const gateway = { convertToPurchase: vi.fn() } as unknown as ShoppingListGateway;

    expect(() => new ConvertShoppingListToPurchaseUseCase(gateway).execute('household-1', {
      itemIds: [],
      items: [],
      purchaseDate: new Date('2026-08-01T12:00:00.000Z'),
      storeName: 'Mercado',
      total: 100,
    })).toThrow('al menos un elemento');
    expect(gateway.convertToPurchase).not.toHaveBeenCalled();
  });
});
