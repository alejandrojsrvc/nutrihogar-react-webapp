export const mealQueryKeys = {
  all: ['meals'] as const,
  detail: (mealId: string) => [...mealQueryKeys.all, 'detail', mealId] as const,
  dailySummary: (profileId: string, date: string) =>
    [...mealQueryKeys.all, 'daily-summary', profileId, date] as const,
};
