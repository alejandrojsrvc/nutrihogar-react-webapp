import { describe, expect, it, vi } from 'vitest';
import { CancelMealUseCase } from './CancelMealUseCase';
import type { MealGateway } from '../ports/MealGateway';

describe('CancelMealUseCase', () => {
  it('delegates cancellation to the gateway', async () => {
    const gateway = {
      cancel: vi.fn().mockResolvedValue(undefined),
    } as unknown as MealGateway;
    await new CancelMealUseCase(gateway).execute('meal-1');
    expect(gateway.cancel).toHaveBeenCalledWith('meal-1');
  });
});
