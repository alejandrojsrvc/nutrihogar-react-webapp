import { describe, expect, it, vi } from 'vitest';

import type { PreparedFoodLeftoverGateway } from '../ports/PreparedFoodLeftoverGateway';
import { CreatePreparedFoodLeftoverUseCase, UpdatePreparedFoodLeftoverStatusUseCase } from './PreparedFoodLeftoverUseCases';

describe('prepared food leftover use cases', () => {
  it('creates a leftover for a batch', async () => {
    const gateway = { create: vi.fn().mockResolvedValue({ id: 'leftover-1' }) } as unknown as PreparedFoodLeftoverGateway;
    const input = { storedAt: new Date('2026-08-01T13:00:00.000Z'), weight: 300 };

    await expect(new CreatePreparedFoodLeftoverUseCase(gateway).execute('batch-1', input)).resolves.toEqual({ id: 'leftover-1' });
    expect(gateway.create).toHaveBeenCalledWith('batch-1', input);
  });

  it('updates a leftover status', async () => {
    const gateway = { updateStatus: vi.fn().mockResolvedValue({ id: 'leftover-1', status: 'DISCARDED' }) } as unknown as PreparedFoodLeftoverGateway;

    await expect(new UpdatePreparedFoodLeftoverStatusUseCase(gateway).execute('leftover-1', 'DISCARDED')).resolves.toEqual({ id: 'leftover-1', status: 'DISCARDED' });
    expect(gateway.updateStatus).toHaveBeenCalledWith('leftover-1', 'DISCARDED');
  });
});
