import { describe, expect, it, vi } from 'vitest';
import { UpdateMealUseCase } from './UpdateMealUseCase';
import type { MealGateway } from '../ports/MealGateway';

describe('UpdateMealUseCase', () => {
  it('rejects an empty meal before calling the gateway', async () => {
    const gateway = { update: vi.fn() } as unknown as MealGateway;
    expect(() => new UpdateMealUseCase(gateway).execute('meal-1', {
      consumedAt: new Date(), items: [], mealType: 'LUNCH', notes: '',
    })).toThrow('al menos un alimento');
    expect(gateway.update).not.toHaveBeenCalled();
  });
});
