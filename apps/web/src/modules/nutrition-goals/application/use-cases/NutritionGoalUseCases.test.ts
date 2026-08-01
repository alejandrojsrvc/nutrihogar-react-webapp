import { describe, expect, it, vi } from 'vitest';

import {
  ConfirmNutritionGoalSuggestionUseCase,
  GenerateNutritionGoalSuggestionUseCase,
} from './NutritionGoalUseCases';
import type { NutritionGoalGateway } from '../ports/NutritionGoalGateway';

describe('nutrition goal use cases', () => {
  it('generates a suggestion through the gateway', async () => {
    const suggestion = { id: 'suggestion-id' } as never;
    const gateway: NutritionGoalGateway = {
      confirmSuggestion: vi.fn(),
      generateSuggestion: vi.fn().mockResolvedValue(suggestion),
      getCurrent: vi.fn(),
    };

    await expect(
      new GenerateNutritionGoalSuggestionUseCase(gateway).execute('profile-id'),
    ).resolves.toBe(suggestion);
    expect(gateway.generateSuggestion).toHaveBeenCalledWith('profile-id');
  });

  it('confirms edited values through the gateway', async () => {
    const goal = { id: 'goal-id' } as never;
    const gateway: NutritionGoalGateway = {
      confirmSuggestion: vi.fn().mockResolvedValue(goal),
      generateSuggestion: vi.fn(),
      getCurrent: vi.fn(),
    };
    const values = { dailyCalories: 2100 };

    await expect(
      new ConfirmNutritionGoalSuggestionUseCase(gateway).execute(
        'suggestion-id',
        values,
      ),
    ).resolves.toBe(goal);
    expect(gateway.confirmSuggestion).toHaveBeenCalledWith('suggestion-id', values);
  });
});
