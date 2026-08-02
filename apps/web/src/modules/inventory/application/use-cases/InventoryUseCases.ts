import type {
  AdjustInventoryItemInput,
  ConsumeInventoryItemInput,
  CreateManualInventoryItemInput,
  InventoryGateway,
  UpdateInventoryItemInput,
} from '../ports/InventoryGateway';
import type { ConnectivityGateway } from '../ports/ConnectivityGateway';
import type {
  InventoryLocalRepository,
  PendingInventoryOperation,
} from '../ports/InventoryLocalRepository';
import type { InventorySyncGateway } from '../ports/InventorySyncGateway';
import type { InventoryFilters, InventoryItem } from '../../domain/Inventory';

export class LoadInventoryUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(householdId: string, filters: InventoryFilters = {}) {
    if (!this.connectivity.isOnline()) {
      const snapshot = await this.localRepository.getSnapshot(householdId);
      if (snapshot) return { items: snapshot, limit: snapshot.length, page: 1, total: snapshot.length };
      throw new Error('No hay un snapshot de inventario disponible sin conexión.');
    }

    const result = await this.gateway.list(householdId, filters);
    await this.localRepository.saveSnapshot(householdId, result.items);
    return result;
  }
}

export class GetInventoryItemUseCase {
  constructor(private readonly gateway: InventoryGateway) {}

  execute(inventoryItemId: string) {
    return this.gateway.getById(inventoryItemId);
  }
}

export class CreateManualInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  execute(householdId: string, input: CreateManualInventoryItemInput) {
    if (!this.connectivity.isOnline()) throw new Error('Crear una existencia requiere conexión.');
    return this.gateway.create(householdId, input);
  }
}

export class AdjustInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  execute(householdId: string, inventoryItem: InventoryItem, input: AdjustInventoryItemInput) {
    if (this.connectivity.isOnline()) return this.gateway.adjust(inventoryItem.id, input);
    return this.queueAdjustment(householdId, inventoryItem, input);
  }

  private async queueAdjustment(
    householdId: string,
    inventoryItem: InventoryItem,
    input: AdjustInventoryItemInput,
  ): Promise<InventoryItem> {
    const operation: PendingInventoryOperation = {
      allowLastWriteWins: false,
      baseVersion: inventoryItem.version,
      inventoryItemId: inventoryItem.id,
      occurredAt: (input.occurredAt ?? new Date()).toISOString(),
      operationId: crypto.randomUUID(),
      newQuantity: input.quantity,
      type: 'ABSOLUTE_ADJUSTMENT',
      unit: input.unit,
    };
    await this.localRepository.saveOperation(householdId, operation);
    const optimistic = optimisticItem(inventoryItem, input.quantity - inventoryItem.currentQuantity);
    await saveOptimisticSnapshot(this.localRepository, householdId, optimistic);
    return optimistic;
  }
}

export class ConsumeInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  execute(householdId: string, inventoryItem: InventoryItem, input: ConsumeInventoryItemInput) {
    if (this.connectivity.isOnline()) return this.gateway.consume(inventoryItem.id, input);
    return this.queueConsumption(householdId, inventoryItem, input);
  }

  private async queueConsumption(
    householdId: string,
    inventoryItem: InventoryItem,
    input: ConsumeInventoryItemInput,
  ) {
    const operation: PendingInventoryOperation = {
      allowLastWriteWins: false,
      baseVersion: inventoryItem.version,
      inventoryItemId: inventoryItem.id,
      movementType: 'CONSUMPTION',
      occurredAt: (input.occurredAt ?? new Date()).toISOString(),
      operationId: crypto.randomUUID(),
      quantity: input.quantity,
      type: 'MOVEMENT',
      unit: input.unit,
    };
    await this.localRepository.saveOperation(householdId, operation);
    const optimistic = optimisticItem(inventoryItem, -input.quantity);
    await saveOptimisticSnapshot(this.localRepository, householdId, optimistic);
    return optimistic;
  }
}

export class WasteInventoryItemUseCase {
  constructor(private readonly gateway: InventoryGateway) {}

  execute(inventoryItemId: string, input: ConsumeInventoryItemInput) {
    return this.gateway.waste(inventoryItemId, input);
  }
}

export class UpdateInventoryItemUseCase {
  constructor(private readonly gateway: InventoryGateway) {}

  execute(inventoryItemId: string, input: UpdateInventoryItemInput) {
    return this.gateway.update(inventoryItemId, input);
  }
}

export class ArchiveInventoryItemUseCase {
  constructor(private readonly gateway: InventoryGateway) {}

  execute(inventoryItemId: string) {
    return this.gateway.archive(inventoryItemId);
  }
}

export class ListInventoryMovementsUseCase {
  constructor(private readonly gateway: InventoryGateway) {}

  execute(inventoryItemId: string) {
    return this.gateway.listMovements(inventoryItemId);
  }
}

export class ListPendingInventoryOperationsUseCase {
  constructor(private readonly localRepository: InventoryLocalRepository) {}

  execute(householdId: string) {
    return this.localRepository.listPendingOperations(householdId);
  }
}

export class SynchronizeInventoryUseCase {
  constructor(
    private readonly gateway: InventorySyncGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
    private readonly deviceId: string,
  ) {}

  async execute(householdId: string) {
    if (!this.connectivity.isOnline()) return { processed: [], conflicts: [], snapshot: null };
    const operations = await this.localRepository.listPendingOperations(householdId);
    if (operations.length === 0) return { processed: [], conflicts: [], snapshot: null };
    const result = await this.gateway.synchronize(householdId, this.deviceId, operations);
    await this.localRepository.markOperationsSynchronized(result.processed);
    if (result.snapshot) await saveOptimisticSnapshot(this.localRepository, householdId, result.snapshot);
    return result;
  }
}

export class GetInventorySyncStatusUseCase {
  constructor(
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(householdId: string) {
    const operations = await this.localRepository.listPendingOperations(householdId);
    return { isOnline: this.connectivity.isOnline(), pendingCount: operations.length };
  }
}

async function saveOptimisticSnapshot(
  repository: InventoryLocalRepository,
  householdId: string,
  item: InventoryItem,
) {
  const snapshot = await repository.getSnapshot(householdId);
  const items = snapshot?.some((current) => current.id === item.id)
    ? snapshot.map((current) => current.id === item.id ? item : current)
    : [...(snapshot ?? []), item];
  await repository.saveSnapshot(householdId, items);
}

function optimisticItem(item: InventoryItem, delta: number): InventoryItem {
  return {
    ...item,
    currentQuantity: Math.max(0, item.currentQuantity + delta),
    status: item.currentQuantity + delta <= 0 ? 'DEPLETED' : item.status,
    updatedAt: new Date().toISOString(),
  };
}
