import type {
  PreparedBatchInventoryDecision,
  PreparedBatchInventoryPreview,
} from '../../domain/PreparedBatchInventory';

export interface PreparedBatchInventoryGateway {
  preview(batchId: string): Promise<PreparedBatchInventoryPreview>;
  confirm(
    batchId: string,
    decisions: PreparedBatchInventoryDecision[],
  ): Promise<void>;
}
