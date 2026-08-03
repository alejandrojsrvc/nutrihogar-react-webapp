import { describe, expect, it, vi } from 'vitest';

import type { ServedPortionConsumptionGateway } from '../ports/ServedPortionConsumptionGateway';
import { ConfirmServedPortionConsumptionUseCase } from './ConfirmServedPortionConsumptionUseCase';

describe('ConfirmServedPortionConsumptionUseCase', () => {
  it('confirms the measured remainder through the gateway', async () => {
    const gateway: ServedPortionConsumptionGateway = {
      confirm: vi.fn().mockResolvedValue({ consumedWeight: 180 }),
    };
    const input = {
      consumedAt: new Date('2026-08-01T13:00:00.000Z'),
      mealType: 'LUNCH',
      remainderDisposition: 'SAVED' as const,
      remainderWeight: 40,
    };

    await expect(
      new ConfirmServedPortionConsumptionUseCase(gateway).execute(
        'portion-1',
        input,
      ),
    ).resolves.toEqual({ consumedWeight: 180 });
    expect(gateway.confirm).toHaveBeenCalledWith('portion-1', input);
  });
});
