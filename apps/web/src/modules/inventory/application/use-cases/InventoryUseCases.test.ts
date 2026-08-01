import { describe, expect, it, vi } from 'vitest';

import type { InventoryGateway } from '../ports/InventoryGateway';
import type { InventoryLocalRepository } from '../ports/InventoryLocalRepository';
import type { ConnectivityGateway } from '../ports/ConnectivityGateway';
import type { InventorySyncGateway } from '../ports/InventorySyncGateway';
import type { InventoryItem } from '../../domain/Inventory';
import {
  AdjustInventoryItemUseCase,
  LoadInventoryUseCase,
  SynchronizeInventoryUseCase,
} from './InventoryUseCases';

const item: InventoryItem = {
  createdAt: '2026-08-01T12:00:00.000Z',
  currentQuantity: 500,
  expiresAt: null,
  foodId: 'food-1',
  householdId: 'household-1',
  id: 'item-1',
  itemType: 'FOOD',
  location: 'Despensa',
  minimumQuantity: 100,
  name: 'Arroz',
  preparedFoodLeftoverId: null,
  status: 'ACTIVE',
  unit: 'GRAM',
  updatedAt: '2026-08-01T12:00:00.000Z',
  version: 2,
};

function localRepository(): InventoryLocalRepository {
  return {
    getSnapshot: vi.fn(),
    listPendingOperations: vi.fn().mockResolvedValue([]),
    markOperationsSynchronized: vi.fn(),
    saveOperation: vi.fn(),
    saveSnapshot: vi.fn(),
  };
}

describe('InventoryUseCases', () => {
  it('loads a remote snapshot and stores it locally when online', async () => {
    const gateway = { list: vi.fn().mockResolvedValue({ items: [item], limit: 20, page: 1, total: 1 }) } as unknown as InventoryGateway;
    const local = localRepository();
    const connectivity: ConnectivityGateway = { isOnline: () => true };

    await expect(new LoadInventoryUseCase(gateway, local, connectivity).execute('household-1')).resolves.toMatchObject({ items: [item] });
    expect(local.saveSnapshot).toHaveBeenCalledWith('household-1', [item]);
  });

  it('returns a local snapshot while offline', async () => {
    const gateway = { list: vi.fn() } as unknown as InventoryGateway;
    const local = localRepository();
    vi.mocked(local.getSnapshot).mockResolvedValue([item]);
    const connectivity: ConnectivityGateway = { isOnline: () => false };

    await expect(new LoadInventoryUseCase(gateway, local, connectivity).execute('household-1')).resolves.toMatchObject({ items: [item] });
    expect(gateway.list).not.toHaveBeenCalled();
  });

  it('queues an absolute adjustment while offline', async () => {
    const local = localRepository();
    const gateway = {} as InventoryGateway;
    const connectivity: ConnectivityGateway = { isOnline: () => false };

    await expect(new AdjustInventoryItemUseCase(gateway, local, connectivity).execute('household-1', item, { quantity: 750, reason: 'Conteo', unit: 'GRAM' })).resolves.toMatchObject({ currentQuantity: 750 });
    expect(local.saveOperation).toHaveBeenCalledWith('household-1', expect.objectContaining({ newQuantity: 750, type: 'ABSOLUTE_ADJUSTMENT' }));
  });

  it('synchronizes pending operations and marks processed ids', async () => {
    const local = localRepository();
    vi.mocked(local.listPendingOperations).mockResolvedValue([{ allowLastWriteWins: false, baseVersion: 2, inventoryItemId: 'item-1', newQuantity: 750, occurredAt: '2026-08-01T12:00:00.000Z', operationId: 'operation-1', type: 'ABSOLUTE_ADJUSTMENT', unit: 'GRAM' }]);
    const gateway: InventorySyncGateway = { synchronize: vi.fn().mockResolvedValue({ conflicts: [], processed: ['operation-1'], snapshot: item }) };
    const connectivity: ConnectivityGateway = { isOnline: () => true };

    await expect(new SynchronizeInventoryUseCase(gateway, local, connectivity, 'device-1').execute('household-1')).resolves.toMatchObject({ processed: ['operation-1'] });
    expect(local.markOperationsSynchronized).toHaveBeenCalledWith(['operation-1']);
  });
});
