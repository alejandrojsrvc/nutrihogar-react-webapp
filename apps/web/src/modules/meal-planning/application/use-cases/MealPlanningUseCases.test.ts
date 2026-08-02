import { describe, expect, it, vi } from 'vitest';
import { CreateWeeklyPlanUseCase } from './MealPlanningUseCases';
import type { MealPlanningGateway } from '../ports/MealPlanningGateway';

describe('CreateWeeklyPlanUseCase', () => {
  it('normalizes the requested date before delegating creation', async () => {
    const gateway = { create: vi.fn().mockResolvedValue({ id: 'plan' }) } as unknown as MealPlanningGateway;
    await new CreateWeeklyPlanUseCase(gateway).execute('household', '2026-08-06');
    expect(gateway.create).toHaveBeenCalledWith('household', '2026-08-03');
  });
});
