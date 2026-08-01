import { describe, expect, it } from 'vitest';

import { toPurchase } from './PurchaseApiMapper';

describe('toPurchase', () => {
  it('maps purchase data without exposing API DTOs to the domain', () => {
    expect(toPurchase({ currency: 'ARS', id: 'purchase-1', items: [{ id: 'item-1', nameSnapshot: 'Arroz', quantity: 2, unit: 'KG' }], status: 'CONFIRMED', storeName: 'Mercado', total: 1200 })).toMatchObject({ currency: 'ARS', id: 'purchase-1', status: 'CONFIRMED', total: 1200 });
  });
});
