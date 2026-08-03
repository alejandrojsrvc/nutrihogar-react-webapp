import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveRecipeUseCase,
  loadRecipeNutritionUseCase,
  loadRecipeUseCase,
  listRecipesUseCase,
  createRecipeUseCase,
  updateRecipeUseCase,
} from '../../../../app/composition/dependencies';
import type {
  CreateRecipeInput,
  RecipeListCriteria,
  UpdateRecipeInput,
} from '../../application/ports/RecipeGateway';
import type { Recipe, RecipeNutrition } from '../../domain/Recipe';

export const recipeQueryKeys = {
  all: ['recipes'] as const,
  detail: (recipeId: string) =>
    [...recipeQueryKeys.all, 'detail', recipeId] as const,
  nutrition: (recipeId: string) =>
    [...recipeQueryKeys.detail(recipeId), 'nutrition'] as const,
  list: (householdId: string, criteria: RecipeListCriteria) =>
    [...recipeQueryKeys.all, 'list', householdId, criteria] as const,
};

export function useRecipes(
  householdId: string | undefined,
  criteria: RecipeListCriteria,
) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId
      ? recipeQueryKeys.list(householdId, criteria)
      : recipeQueryKeys.all,
    queryFn: () => listRecipesUseCase.execute(householdId as string, criteria),
    retry: false,
  });
}

export function useRecipeNutrition(recipeId: string | undefined) {
  return useQuery<RecipeNutrition>({
    enabled: Boolean(recipeId),
    queryKey: recipeId
      ? recipeQueryKeys.nutrition(recipeId)
      : recipeQueryKeys.all,
    queryFn: () => loadRecipeNutritionUseCase.execute(recipeId as string),
    retry: false,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdId,
      input,
    }: {
      householdId: string;
      input: CreateRecipeInput;
    }) => createRecipeUseCase.execute(householdId, input),
    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeQueryKeys.detail(recipe.id), recipe);
      void queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recipeId,
      input,
    }: {
      recipeId: string;
      input: UpdateRecipeInput;
    }) => updateRecipeUseCase.execute(recipeId, input),
    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeQueryKeys.detail(recipe.id), recipe);
      void queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: recipeQueryKeys.nutrition(recipe.id),
      });
    },
  });
}

export function useArchiveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => archiveRecipeUseCase.execute(recipeId),
    onSuccess: (_, recipeId) => {
      void queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: recipeQueryKeys.detail(recipeId),
      });
    },
  });
}

export function useRecipe(recipeId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery<Recipe>({
    enabled: Boolean(recipeId),
    initialData: recipeId
      ? queryClient.getQueryData<Recipe>(recipeQueryKeys.detail(recipeId))
      : undefined,
    queryKey: recipeId ? recipeQueryKeys.detail(recipeId) : recipeQueryKeys.all,
    queryFn: () => loadRecipeUseCase.execute(recipeId as string),
    retry: false,
  });
}
