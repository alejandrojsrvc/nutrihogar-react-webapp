import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDailyNutritionSummaryUseCase,
  getMealDetailsUseCase,
  registerMealUseCase,
  updateMealUseCase,
  cancelMealUseCase,
  duplicateMealUseCase,
} from '../../../../app/composition/dependencies';
import type { DuplicateMealInput, RegisterMealInput, UpdateMealInput } from '../../application/ports/MealGateway';

export const mealQueryKeys = {
  all: ['meals'] as const,
  detail: (mealId: string) => [...mealQueryKeys.all, 'detail', mealId] as const,
  dailySummary: (profileId: string, date: string) =>
    [...mealQueryKeys.all, 'daily-summary', profileId, date] as const,
};

export function useRegisterMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterMealInput) => registerMealUseCase.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mealQueryKeys.all }),
  });
}

export function useDailyNutritionSummary(profileId: string | undefined, date: string) {
  return useQuery({
    enabled: Boolean(profileId && date),
    queryKey: profileId ? mealQueryKeys.dailySummary(profileId, date) : mealQueryKeys.all,
    queryFn: () => getDailyNutritionSummaryUseCase.execute(profileId as string, date),
    retry: false,
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, input }: { mealId: string; input: UpdateMealInput }) => updateMealUseCase.execute(mealId, input),
    onSuccess: (meal) => {
      queryClient.setQueryData(mealQueryKeys.detail(meal.id), meal);
      void queryClient.invalidateQueries({ queryKey: mealQueryKeys.all });
    },
  });
}

export function useCancelMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => cancelMealUseCase.execute(mealId),
    onSuccess: (_, mealId) => {
      void queryClient.invalidateQueries({ queryKey: mealQueryKeys.detail(mealId) });
      void queryClient.invalidateQueries({ queryKey: mealQueryKeys.all });
    },
  });
}

export function useDuplicateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, input }: { mealId: string; input: DuplicateMealInput }) => duplicateMealUseCase.execute(mealId, input),
    onSuccess: (meal) => {
      queryClient.setQueryData(mealQueryKeys.detail(meal.id), meal);
      void queryClient.invalidateQueries({ queryKey: mealQueryKeys.all });
    },
  });
}

export function useMealDetails(mealId: string | undefined) {
  return useQuery({
    enabled: Boolean(mealId),
    queryKey: mealId ? mealQueryKeys.detail(mealId) : mealQueryKeys.all,
    queryFn: () => getMealDetailsUseCase.execute(mealId as string),
    retry: false,
  });
}
