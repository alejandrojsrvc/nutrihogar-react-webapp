import { describe, expect, it, vi } from 'vitest';

import { RegisterMealUseCase } from './RegisterMealUseCase';
import type { MealGateway } from '../ports/MealGateway';

describe('RegisterMealUseCase', () => {
  it('rejects an empty meal before calling the gateway', async () => {
    const gateway: MealGateway = {
      cancel: vi.fn(),
      duplicate: vi.fn(),
      getById: vi.fn(),
      register: vi.fn(),
      update: vi.fn(),
    };
    const useCase = new RegisterMealUseCase(gateway);

    expect(() =>
      useCase.execute({
        consumedAt: new Date(),
        householdId: 'household-id',
        items: [],
        mealType: 'LUNCH',
        notes: '',
        profileId: 'profile-id',
      }),
    ).toThrow('al menos un alimento');
    expect(gateway.register).not.toHaveBeenCalled();
  });
});
