import { describe, expect, it, vi } from 'vitest';

import type { InventoryGateway } from '../ports/InventoryGateway';
import type { InventoryLocalRepository } from '../ports/InventoryLocalRepository';
import type { ConnectivityGateway } from '../ports/ConnectivityGateway';
import type { InventorySyncGateway } from '../ports/InventorySyncGateway';
import type { InventoryItem } from '../../domain/Inventory';
import {
  AdjustInventoryItemUseCase,
  ExpireInventoryItemUseCase,
  WasteInventoryItemUseCase,
  ConsumePreparedFoodUseCase,
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

  it('keeps conflicts visible instead of deleting their operations', async () => {
    const local = localRepository();
    local.markOperationsConflicted = vi.fn();
    local.saveSyncResults = vi.fn();
    vi.mocked(local.listPendingOperations).mockResolvedValue([{ allowLastWriteWins: false, baseVersion: 2, inventoryItemId: 'item-1', quantity: 100, occurredAt: '2026-08-01T12:00:00.000Z', operationId: 'operation-2', type: 'MOVEMENT', unit: 'GRAM' }]);
    const gateway: InventorySyncGateway = { synchronize: vi.fn().mockResolvedValue({ conflicts: [{ conflictCode: 'INSUFFICIENT_BALANCE', operationId: 'operation-2', reason: 'Cantidad insuficiente', resultingVersion: 3, retryable: false, snapshot: item }], processed: [], snapshot: item }) };
    const connectivity: ConnectivityGateway = { isOnline: () => true };

    await new SynchronizeInventoryUseCase(gateway, local, connectivity, 'device-1').execute('household-1');

    expect(local.markOperationsConflicted).toHaveBeenCalledWith(['operation-2'], { 'operation-2': { conflictCode: 'INSUFFICIENT_BALANCE', reason: 'Cantidad insuficiente', resultingVersion: 3, retryable: false } });
    expect(local.saveSyncResults).toHaveBeenCalledWith([expect.objectContaining({ operationId: 'operation-2', status: 'CONFLICT' })]);
    expect(local.markOperationsSynchronized).toHaveBeenCalledWith([]);
  });

  it('queues a waste exit offline and updates the local balance', async () => {
    const local = localRepository();
    const connectivity: ConnectivityGateway = { isOnline: () => false };

    await expect(new WasteInventoryItemUseCase({} as InventoryGateway, local, connectivity).execute('household-1', item, { quantity: 125, unit: 'GRAM' })).resolves.toMatchObject({ currentQuantity: 375 });
    expect(local.saveOperation).toHaveBeenCalledWith('household-1', expect.objectContaining({ movementType: 'WASTE', quantity: 125 }));
  });

  it('queues an expiration exit offline and rejects quantities above the balance', async () => {
    const local = localRepository();
    const connectivity: ConnectivityGateway = { isOnline: () => false };
    const useCase = new ExpireInventoryItemUseCase({} as InventoryGateway, local, connectivity);

    await expect(useCase.execute('household-1', item, { quantity: 500, unit: 'GRAM' })).resolves.toMatchObject({ currentQuantity: 0 });
    expect(local.saveOperation).toHaveBeenCalledWith('household-1', expect.objectContaining({ movementType: 'EXPIRATION' }));
    await expect(useCase.execute('household-1', item, { quantity: 501, unit: 'GRAM' })).rejects.toThrow('no superar');
  });

  it('only allows prepared inventory items in the meal-producing flow', async () => {
    const gateway = { consumePrepared: vi.fn() } as unknown as InventoryGateway;
    const prepared = { ...item, itemType: 'PREPARED_FOOD' as const };
    const useCase = new ConsumePreparedFoodUseCase(gateway);

    await expect(useCase.execute(prepared, { adultProfileId: 'profile-1', consumedAt: new Date(), mealType: 'LUNCH', quantity: 100 })).resolves.toBeUndefined();
    expect(gateway.consumePrepared).toHaveBeenCalled();
    await expect(useCase.execute(item, { adultProfileId: 'profile-1', consumedAt: new Date(), mealType: 'LUNCH', quantity: 10 })).rejects.toThrow('alimentos preparados');
  });
});
