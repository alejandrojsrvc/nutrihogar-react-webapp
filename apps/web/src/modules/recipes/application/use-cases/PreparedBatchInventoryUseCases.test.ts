import { describe, expect, it, vi } from 'vitest';

import type { PreparedBatchInventoryGateway } from '../ports/PreparedBatchInventoryGateway';
import { ConfirmPreparedBatchInventoryUseCase, LoadPreparedBatchInventoryPreviewUseCase } from './PreparedBatchInventoryUseCases';

describe('prepared batch inventory use cases', () => {
  it('loads the inventory preview', async () => {
    const gateway = { preview: vi.fn().mockResolvedValue({ batchId: 'batch-1', ingredients: [], alreadyConfirmed: false }) } as PreparedBatchInventoryGateway;

    await expect(new LoadPreparedBatchInventoryPreviewUseCase(gateway).execute('batch-1')).resolves.toMatchObject({ batchId: 'batch-1' });
    expect(gateway.preview).toHaveBeenCalledWith('batch-1');
  });

  it('requires decisions before confirming ingredient consumption', async () => {
    const gateway = { confirm: vi.fn().mockResolvedValue(undefined) } as PreparedBatchInventoryGateway;
    const useCase = new ConfirmPreparedBatchInventoryUseCase(gateway);

    expect(() => useCase.execute('batch-1', [])).toThrow('ingredientes');
    await expect(useCase.execute('batch-1', [{ action: 'IGNORE', ingredientId: 'ingredient-1' }])).resolves.toBeUndefined();
    expect(gateway.confirm).toHaveBeenCalledWith('batch-1', [{ action: 'IGNORE', ingredientId: 'ingredient-1' }]);
  });
});
