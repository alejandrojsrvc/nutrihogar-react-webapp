import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadRecipeUseCase, listRecipesUseCase } from '../../../../app/composition/dependencies';
import type { RecipeListCriteria } from '../../application/ports/RecipeGateway';

export const recipeQueryKeys = {
  all: ['recipes'] as const,
  detail: (recipeId: string) => [...recipeQueryKeys.all, 'detail', recipeId] as const,
  list: (householdId: string, criteria: RecipeListCriteria) => [...recipeQueryKeys.all, 'list', householdId, criteria] as const,
};

export function useRecipes(householdId: string | undefined, criteria: RecipeListCriteria) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId ? recipeQueryKeys.list(householdId, criteria) : recipeQueryKeys.all,
    queryFn: () => listRecipesUseCase.execute(householdId as string, criteria),
    retry: false,
  });
}

export function useRecipe(recipeId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    enabled: Boolean(recipeId),
    initialData: recipeId ? queryClient.getQueryData(recipeQueryKeys.detail(recipeId)) : undefined,
    queryKey: recipeId ? recipeQueryKeys.detail(recipeId) : recipeQueryKeys.all,
    queryFn: () => loadRecipeUseCase.execute(recipeId as string),
    retry: false,
  });
}
