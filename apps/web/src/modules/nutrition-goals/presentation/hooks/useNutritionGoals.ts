import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  confirmNutritionGoalSuggestionUseCase,
  generateNutritionGoalSuggestionUseCase,
  getCurrentNutritionGoalUseCase,
} from '../../../../app/composition/dependencies';
import type { NutritionGoalValues } from '@nutrihogar/schemas';
import type { NutritionGoalSuggestion } from '../../application/ports/NutritionGoalGateway';

export const nutritionGoalQueryKeys = {
  all: ['nutrition-goals'] as const,
  current: (profileId: string) =>
    [...nutritionGoalQueryKeys.all, 'current', profileId] as const,
  suggestion: (profileId: string) =>
    [...nutritionGoalQueryKeys.all, 'suggestion', profileId] as const,
};

export function useCurrentNutritionGoal(profileId: string | undefined) {
  return useQuery({
    enabled: Boolean(profileId),
    queryKey: profileId
      ? nutritionGoalQueryKeys.current(profileId)
      : nutritionGoalQueryKeys.all,
    queryFn: () => getCurrentNutritionGoalUseCase.execute(profileId as string),
    retry: false,
  });
}

export function useNutritionGoalSuggestion(profileId: string | undefined) {
  const queryClient = useQueryClient();
  const key = profileId
    ? nutritionGoalQueryKeys.suggestion(profileId)
    : nutritionGoalQueryKeys.all;
  return {
    data: queryClient.getQueryData<NutritionGoalSuggestion>(key),
    isPending: false,
    isError: false,
  };
}

export function useGenerateNutritionGoalSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) =>
      generateNutritionGoalSuggestionUseCase.execute(profileId),
    onSuccess: (suggestion, profileId) => {
      queryClient.setQueryData(
        nutritionGoalQueryKeys.suggestion(profileId),
        suggestion,
      );
    },
  });
}

export function useConfirmNutritionGoalSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      suggestionId,
      values,
    }: {
      suggestionId: string;
      profileId: string;
      values: Partial<NutritionGoalValues>;
    }) => confirmNutritionGoalSuggestionUseCase.execute(suggestionId, values),
    onSuccess: (goal, { profileId }) => {
      queryClient.setQueryData(nutritionGoalQueryKeys.current(profileId), goal);
      queryClient.invalidateQueries({ queryKey: nutritionGoalQueryKeys.all });
    },
  });
}
