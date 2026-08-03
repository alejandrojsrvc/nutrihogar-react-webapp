import { describe, expect, it, vi } from 'vitest';

import { GetDailyNutritionSummaryUseCase } from './GetDailyNutritionSummaryUseCase';

describe('GetDailyNutritionSummaryUseCase', () => {
  it('loads the summary through its gateway', async () => {
    const summary = { date: '2026-07-29' } as never;
    const gateway = { getByProfileAndDate: vi.fn().mockResolvedValue(summary) };

    await expect(
      new GetDailyNutritionSummaryUseCase(gateway).execute(
        'profile-1',
        '2026-07-29',
      ),
    ).resolves.toBe(summary);
    expect(gateway.getByProfileAndDate).toHaveBeenCalledWith(
      'profile-1',
      '2026-07-29',
    );
  });
});
