import type { PreparedFoodLeftover } from '../../domain/PreparedBatch';

export type PreparedFoodLeftoverStatus = 'CONSUMED' | 'DISCARDED' | 'EXPIRED';

export interface CreatePreparedFoodLeftoverInput {
  weight: number;
  storedAt: Date;
  storageLocation?: string;
  notes?: string;
}

export interface PreparedFoodLeftoverGateway {
  create(
    batchId: string,
    input: CreatePreparedFoodLeftoverInput,
  ): Promise<PreparedFoodLeftover>;
  list(householdId: string): Promise<PreparedFoodLeftover[]>;
  getById(leftoverId: string): Promise<PreparedFoodLeftover>;
  updateStatus(
    leftoverId: string,
    status: PreparedFoodLeftoverStatus,
  ): Promise<PreparedFoodLeftover>;
}
