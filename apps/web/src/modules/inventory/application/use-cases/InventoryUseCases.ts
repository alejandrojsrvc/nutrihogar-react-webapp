import type {
  AdjustInventoryItemInput,
  ConsumeInventoryItemInput,
  CreateManualInventoryItemInput,
  InventoryGateway,
  UpdateInventoryItemInput,
  ConsumePreparedFoodInput,
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
      if (snapshot)
        return {
          items: snapshot,
          limit: snapshot.length,
          page: 1,
          total: snapshot.length,
        };
      throw new Error(
        'No hay un snapshot de inventario disponible sin conexión.',
      );
    }

    const result = await this.gateway.list(householdId, filters);
    try {
      const hasFilters = Object.entries(filters).some(
        ([, value]) => value !== undefined,
      );
      const isComplete =
        !hasFilters &&
        (!filters.page || filters.page === 1) &&
        (!filters.limit || result.items.length >= result.total);
      if (isComplete) {
        await this.localRepository.saveSnapshot(householdId, result.items);
      } else {
        const current = await this.localRepository.getSnapshot(householdId);
        const byId = new Map((current ?? []).map((item) => [item.id, item]));
        result.items.forEach((item) => byId.set(item.id, item));
        await this.localRepository.saveSnapshot(householdId, [
          ...byId.values(),
        ]);
      }
    } catch {
      // La caché no debe ocultar un inventario remoto disponible.
    }
    return result;
  }
}

export class GetInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(inventoryItemId: string) {
    if (!this.connectivity.isOnline()) {
      const item =
        await this.localRepository.getSnapshotForItem?.(inventoryItemId);
      if (item) return item;
      throw new Error('No hay una existencia disponible sin conexión.');
    }
    return this.gateway.getById(inventoryItemId);
  }
}

export class CreateManualInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  execute(householdId: string, input: CreateManualInventoryItemInput) {
    if (!this.connectivity.isOnline())
      throw new Error('Crear una existencia requiere conexión.');
    return this.gateway.create(householdId, input);
  }
}

export class AdjustInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(
    householdId: string,
    inventoryItem: InventoryItem,
    input: AdjustInventoryItemInput,
  ) {
    if (this.connectivity.isOnline()) {
      const result = await this.gateway.adjust(inventoryItem.id, input);
      await saveRemoteSnapshot(this.localRepository, householdId, result);
      return result;
    }
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
      payload: { reason: input.reason },
      type: 'ABSOLUTE_ADJUSTMENT',
      unit: input.unit,
    };
    const optimistic = optimisticItem(
      inventoryItem,
      input.quantity - inventoryItem.currentQuantity,
    );
    await saveOperationAndOptimisticSnapshot(
      this.localRepository,
      householdId,
      operation,
      optimistic,
    );
    return optimistic;
  }
}

export class ConsumeInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(
    householdId: string,
    inventoryItem: InventoryItem,
    input: ConsumeInventoryItemInput,
  ) {
    validateExit(inventoryItem, input);
    if (this.connectivity.isOnline()) {
      const result = await this.gateway.consume(inventoryItem.id, input);
      await saveRemoteSnapshot(this.localRepository, householdId, result);
      return result;
    }
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
      payload: input.reason ? { reason: input.reason } : undefined,
      quantity: input.quantity,
      type: 'MOVEMENT',
      unit: input.unit,
    };
    const optimistic = optimisticItem(inventoryItem, -input.quantity);
    await saveOperationAndOptimisticSnapshot(
      this.localRepository,
      householdId,
      operation,
      optimistic,
    );
    return optimistic;
  }
}

export class WasteInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(
    householdId: string,
    inventoryItem: InventoryItem,
    input: ConsumeInventoryItemInput,
  ) {
    validateExit(inventoryItem, input);
    if (this.connectivity.isOnline()) {
      const result = await this.gateway.waste(inventoryItem.id, input);
      await saveRemoteSnapshot(this.localRepository, householdId, result);
      return result;
    }
    return queueMovement(
      this.localRepository,
      householdId,
      inventoryItem,
      input,
      'WASTE',
    );
  }
}

export class ExpireInventoryItemUseCase {
  constructor(
    private readonly gateway: InventoryGateway,
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(
    householdId: string,
    inventoryItem: InventoryItem,
    input: ConsumeInventoryItemInput,
  ) {
    validateExit(inventoryItem, input);
    if (this.connectivity.isOnline()) {
      const result = await this.gateway.expire(inventoryItem.id, input);
      await saveRemoteSnapshot(this.localRepository, householdId, result);
      return result;
    }
    return queueMovement(
      this.localRepository,
      householdId,
      inventoryItem,
      input,
      'EXPIRATION',
    );
  }
}

export class UpdateInventoryItemUseCase {
  constructor(private readonly gateway: InventoryGateway) {}

  execute(inventoryItemId: string, input: UpdateInventoryItemInput) {
    return this.gateway.update(inventoryItemId, input);
  }
}

export class ConsumePreparedFoodUseCase {
  constructor(private readonly gateway: InventoryGateway) {}

  execute(inventoryItem: InventoryItem, input: ConsumePreparedFoodInput) {
    if (inventoryItem.itemType !== 'PREPARED_FOOD')
      throw new Error(
        'Solo puedes consumir alimentos preparados desde este flujo.',
      );
    if (input.quantity <= 0 || input.quantity > inventoryItem.currentQuantity) {
      throw new Error(
        'La cantidad debe ser mayor que cero y no superar la disponibilidad.',
      );
    }
    return this.gateway.consumePrepared(inventoryItem.id, input);
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

export class ListInventoryConflictOperationsUseCase {
  constructor(private readonly localRepository: InventoryLocalRepository) {}

  execute(householdId: string) {
    return this.localRepository.listConflictOperations
      ? this.localRepository.listConflictOperations(householdId)
      : Promise.resolve([]);
  }
}

export class DiscardInventoryOperationUseCase {
  constructor(private readonly localRepository: InventoryLocalRepository) {}

  execute(operationId: string) {
    if (!this.localRepository.discardOperation)
      throw new Error(
        'No se puede descartar la operación en este dispositivo.',
      );
    return this.localRepository.discardOperation(operationId);
  }
}

export class RetryInventoryOperationUseCase {
  constructor(private readonly localRepository: InventoryLocalRepository) {}

  execute(operationId: string, baseVersion: number) {
    if (!this.localRepository.retryOperation)
      throw new Error(
        'No se puede reintentar la operación en este dispositivo.',
      );
    return this.localRepository.retryOperation(operationId, baseVersion);
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
    if (!this.connectivity.isOnline())
      return { processed: [], conflicts: [], snapshot: null };
    if (this.localRepository.recoverSyncingOperations)
      await this.localRepository.recoverSyncingOperations(householdId);
    const operations =
      await this.localRepository.listPendingOperations(householdId);
    if (operations.length === 0)
      return { processed: [], conflicts: [], snapshot: null };
    if (this.localRepository.markOperationsSyncing) {
      await this.localRepository.markOperationsSyncing(
        operations.map((operation) => operation.operationId),
      );
    }
    let result: Awaited<ReturnType<InventorySyncGateway['synchronize']>>;
    try {
      result = await this.gateway.synchronize(
        householdId,
        this.deviceId,
        operations,
      );
    } catch (error) {
      if (this.localRepository.markOperationsFailed) {
        await this.localRepository.markOperationsFailed(
          operations.map((operation) => operation.operationId),
          error instanceof Error ? error.message : 'No se pudo sincronizar',
        );
      }
      throw error;
    }
    await this.localRepository.markOperationsSynchronized(result.processed);
    if (
      result.processedSnapshots &&
      this.localRepository.saveOperationSnapshots
    ) {
      await this.localRepository.saveOperationSnapshots(
        result.processedSnapshots,
      );
    }
    for (const snapshot of Object.values(result.processedSnapshots ?? {})) {
      await saveOptimisticSnapshot(this.localRepository, householdId, snapshot);
    }
    const conflictIds = result.conflicts.map(
      (conflict) => conflict.operationId,
    );
    if (conflictIds.length && this.localRepository.markOperationsConflicted) {
      await this.localRepository.markOperationsConflicted(
        conflictIds,
        Object.fromEntries(
          result.conflicts.map((conflict) => [
            conflict.operationId,
            {
              conflictCode: conflict.conflictCode,
              reason: conflict.reason,
              resultingVersion: conflict.resultingVersion,
              retryable: conflict.retryable,
              snapshot: conflict.snapshot,
            },
          ]),
        ),
      );
    }
    for (const conflict of result.conflicts) {
      if (conflict.snapshot)
        await saveOptimisticSnapshot(
          this.localRepository,
          householdId,
          conflict.snapshot,
        );
    }
    if (this.localRepository.saveSyncResults) {
      await this.localRepository.saveSyncResults([
        ...result.processed.map((operationId) => ({
          createdAt: new Date().toISOString(),
          householdId,
          operationId,
          reason: null,
          status: 'APPLIED' as const,
        })),
        ...result.conflicts.map((conflict) => ({
          createdAt: new Date().toISOString(),
          householdId,
          operationId: conflict.operationId,
          reason: conflict.reason,
          status: 'CONFLICT' as const,
        })),
      ]);
    }
    if (result.snapshot)
      await saveOptimisticSnapshot(
        this.localRepository,
        householdId,
        result.snapshot,
      );
    return result;
  }
}

async function queueMovement(
  repository: InventoryLocalRepository,
  householdId: string,
  inventoryItem: InventoryItem,
  input: ConsumeInventoryItemInput,
  movementType: 'WASTE' | 'EXPIRATION',
) {
  validateExit(inventoryItem, input);
  const operation: PendingInventoryOperation = {
    allowLastWriteWins: false,
    baseVersion: inventoryItem.version,
    inventoryItemId: inventoryItem.id,
    movementType,
    occurredAt: (input.occurredAt ?? new Date()).toISOString(),
    operationId: crypto.randomUUID(),
    payload: input.reason ? { reason: input.reason } : undefined,
    quantity: input.quantity,
    type: 'MOVEMENT',
    unit: input.unit,
  };
  const optimistic = optimisticItem(inventoryItem, -input.quantity);
  await saveOperationAndOptimisticSnapshot(
    repository,
    householdId,
    operation,
    optimistic,
  );
  return optimistic;
}

function validateExit(
  inventoryItem: InventoryItem,
  input: ConsumeInventoryItemInput,
) {
  if (
    input.quantity <= 0 ||
    input.quantity > inventoryItem.currentQuantity ||
    input.unit !== inventoryItem.unit
  ) {
    throw new Error(
      'La cantidad debe ser mayor que cero, usar la unidad disponible y no superar el saldo.',
    );
  }
}

export class GetInventorySyncStatusUseCase {
  constructor(
    private readonly localRepository: InventoryLocalRepository,
    private readonly connectivity: ConnectivityGateway,
  ) {}

  async execute(householdId: string) {
    const operations =
      await this.localRepository.listPendingOperations(householdId);
    const conflicts = this.localRepository.listConflictOperations
      ? await this.localRepository.listConflictOperations(householdId)
      : [];
    const lastSyncAt = this.localRepository.getLastSyncAt
      ? await this.localRepository.getLastSyncAt(householdId)
      : null;
    return {
      conflictsCount: conflicts.length,
      isOnline: this.connectivity.isOnline(),
      lastSyncAt,
      pendingCount: operations.length,
    };
  }
}

async function saveOperationAndOptimisticSnapshot(
  repository: InventoryLocalRepository,
  householdId: string,
  operation: PendingInventoryOperation,
  item: InventoryItem,
) {
  const snapshot = await repository.getSnapshot(householdId);
  const items = snapshot?.some((current) => current.id === item.id)
    ? snapshot.map((current) => (current.id === item.id ? item : current))
    : [...(snapshot ?? []), item];
  if (repository.saveOperationAndSnapshot) {
    await repository.saveOperationAndSnapshot(householdId, operation, items);
    return;
  }
  await repository.saveOperation(householdId, operation);
  await repository.saveSnapshot(householdId, items);
}

async function saveRemoteSnapshot(
  repository: InventoryLocalRepository,
  householdId: string,
  item: InventoryItem,
) {
  try {
    const snapshot = await repository.getSnapshot(householdId);
    const items = snapshot?.some((current) => current.id === item.id)
      ? snapshot.map((current) => (current.id === item.id ? item : current))
      : [...(snapshot ?? []), item];
    await repository.saveSnapshot(householdId, items);
  } catch {
    // La caché no debe convertir una mutación remota exitosa en un error.
  }
}

async function saveOptimisticSnapshot(
  repository: InventoryLocalRepository,
  householdId: string,
  item: InventoryItem,
) {
  const snapshot = await repository.getSnapshot(householdId);
  const items = snapshot?.some((current) => current.id === item.id)
    ? snapshot.map((current) => (current.id === item.id ? item : current))
    : [...(snapshot ?? []), item];
  await repository.saveSnapshot(householdId, items);
}

function optimisticItem(item: InventoryItem, delta: number): InventoryItem {
  const quantity = Math.max(0, item.currentQuantity + delta);
  return {
    ...item,
    currentQuantity: quantity,
    status: quantity <= 0 ? 'DEPLETED' : 'ACTIVE',
    updatedAt: new Date().toISOString(),
  };
}
