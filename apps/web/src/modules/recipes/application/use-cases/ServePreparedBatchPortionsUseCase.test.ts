import { describe, expect, it, vi } from 'vitest';
import { ServePreparedBatchPortionsUseCase } from './ServePreparedBatchPortionsUseCase';
import type { ServedPortionGateway } from '../ports/ServedPortionGateway';

describe('ServePreparedBatchPortionsUseCase', () => {
  it('rejects invalid weights before calling the gateway', () => {
    const gateway = { serve: vi.fn() } as unknown as ServedPortionGateway;
    expect(() => new ServePreparedBatchPortionsUseCase(gateway).execute('batch-1', { portions: [{ adultProfileId: 'profile-1', servedWeight: 0 }] })).toThrow('porción válida');
    expect(gateway.serve).not.toHaveBeenCalled();
  });
});
