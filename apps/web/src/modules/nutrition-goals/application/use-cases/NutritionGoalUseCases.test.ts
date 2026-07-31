import { describe, expect, it, vi } from 'vitest';

import {
  ConfirmNutritionGoalSuggestionUseCase,
  GenerateNutritionGoalSuggestionUseCase,
} from './NutritionGoalUseCases';

describe('nutrition goal use cases', () => {
  it('generates a suggestion through the gateway', async () => {
    const suggestion = { id: 'suggestion-id' } as never;
    const gateway = { generateSuggestion: vi.fn().mockResolvedValue(suggestion) };

    await expect(
      new GenerateNutritionGoalSuggestionUseCase(gateway).execute('profile-id'),
    ).resolves.toBe(suggestion);
    expect(gateway.generateSuggestion).toHaveBeenCalledWith('profile-id');
  });

  it('confirms edited values through the gateway', async () => {
    const goal = { id: 'goal-id' } as never;
    const gateway = { confirmSuggestion: vi.fn().mockResolvedValue(goal) };
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
