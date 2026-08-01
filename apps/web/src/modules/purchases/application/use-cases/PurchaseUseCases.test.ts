import { describe, expect, it, vi } from 'vitest';

import type { PurchaseGateway } from '../ports/PurchaseGateway';
import { CreatePurchaseUseCase, ConfirmPurchaseUseCase } from './PurchaseUseCases';

describe('PurchaseUseCases', () => {
  it('does not create an empty purchase draft', async () => {
    const gateway = { create: vi.fn() } as unknown as PurchaseGateway;

    await expect(new CreatePurchaseUseCase(gateway).execute('household-1', {
      items: [],
      purchaseDate: new Date('2026-08-01T12:00:00.000Z'),
      storeName: 'Mercado',
      total: 100,
    })).rejects.toThrow('Agrega al menos un producto');
    expect(gateway.create).not.toHaveBeenCalled();
  });

  it('confirms a purchase through the gateway', async () => {
    const gateway = { confirm: vi.fn().mockResolvedValue({ id: 'purchase-1' }) } as unknown as PurchaseGateway;

    await expect(new ConfirmPurchaseUseCase(gateway).execute('purchase-1')).resolves.toMatchObject({ id: 'purchase-1' });
    expect(gateway.confirm).toHaveBeenCalledWith('purchase-1');
  });
});
