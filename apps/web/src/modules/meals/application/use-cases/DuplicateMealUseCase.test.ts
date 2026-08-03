import { describe, expect, it, vi } from 'vitest';
import { DuplicateMealUseCase } from './DuplicateMealUseCase';
import type { MealGateway } from '../ports/MealGateway';

describe('DuplicateMealUseCase', () => {
  it('delegates the destination details without changing the original', async () => {
    const gateway = {
      duplicate: vi.fn().mockResolvedValue({ id: 'new-meal' }),
    } as unknown as MealGateway;
    const input = {
      adultProfileId: 'profile-1',
      consumedAt: new Date('2026-08-01T13:00:00.000Z'),
      mealType: 'LUNCH',
    };
    await new DuplicateMealUseCase(gateway).execute('meal-1', input);
    expect(gateway.duplicate).toHaveBeenCalledWith('meal-1', input);
  });
});
