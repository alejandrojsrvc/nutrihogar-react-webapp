import type { PreparedBatchInventoryGateway } from '../ports/PreparedBatchInventoryGateway';
import type { PreparedBatchInventoryDecision } from '../../domain/PreparedBatchInventory';

export class LoadPreparedBatchInventoryPreviewUseCase {
  constructor(private readonly gateway: PreparedBatchInventoryGateway) {}

  execute(batchId: string) {
    return this.gateway.preview(batchId);
  }
}

export class ConfirmPreparedBatchInventoryUseCase {
  constructor(private readonly gateway: PreparedBatchInventoryGateway) {}

  execute(batchId: string, decisions: PreparedBatchInventoryDecision[]) {
    if (decisions.length === 0)
      throw new Error('Selecciona qué ingredientes consumir o ignorar.');
    return this.gateway.confirm(batchId, decisions);
  }
}
