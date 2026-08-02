import { describe, expect, it, vi } from 'vitest';
import { AcceptQuantitySuggestionsUseCase, AssignParticipantUseCase, CompareInventoryUseCase, CreateWeeklyPlanUseCase, DeleteParticipantUseCase, GetRequirementsUseCase, ListQuantitiesUseCase, ProposeQuantitiesUseCase, UpdateParticipantUseCase } from './MealPlanningUseCases';
import type { MealPlanningGateway } from '../ports/MealPlanningGateway';

describe('CreateWeeklyPlanUseCase', () => {
  it('normalizes the requested date before delegating creation', async () => {
    const gateway = { create: vi.fn().mockResolvedValue({ id: 'plan' }) } as unknown as MealPlanningGateway;
    await new CreateWeeklyPlanUseCase(gateway).execute('household', '2026-08-06');
    expect(gateway.create).toHaveBeenCalledWith('household', '2026-08-03');
  });
});

describe('Meal planning participant and nutrition use cases', () => {
  it('delegates participant changes and quantity workflows to the gateway', async () => {
    const gateway = {
      assignParticipant: vi.fn().mockResolvedValue({ id: 'plan' }),
      deleteParticipant: vi.fn().mockResolvedValue(undefined),
      proposeQuantities: vi.fn().mockResolvedValue([]),
      listQuantities: vi.fn().mockResolvedValue([]),
      acceptQuantitySuggestions: vi.fn().mockResolvedValue({ id: 'plan' }),
      updateParticipant: vi.fn().mockResolvedValue({ id: 'plan' }),
      getRequirements: vi.fn().mockResolvedValue({ items: [], warnings: [] }),
      compareInventory: vi.fn().mockResolvedValue({ items: [], warnings: [] }),
    } as unknown as MealPlanningGateway;
    await new AssignParticipantUseCase(gateway).execute('meal', 'adult');
    await new DeleteParticipantUseCase(gateway).execute('participant');
    await new ProposeQuantitiesUseCase(gateway).execute('meal');
    await new ListQuantitiesUseCase(gateway).execute('meal');
    await new AcceptQuantitySuggestionsUseCase(gateway).execute('meal');
    await new UpdateParticipantUseCase(gateway).execute('participant', { confirmedQuantity: 1.5, confirmedUnit: 'SERVING' });
    await new GetRequirementsUseCase(gateway).execute('plan');
    await new CompareInventoryUseCase(gateway).execute('plan');
    expect(gateway.assignParticipant).toHaveBeenCalledWith('meal', 'adult');
    expect(gateway.updateParticipant).toHaveBeenCalledWith('participant', { confirmedQuantity: 1.5, confirmedUnit: 'SERVING' });
    expect(gateway.compareInventory).toHaveBeenCalledWith('plan');
  });
});
