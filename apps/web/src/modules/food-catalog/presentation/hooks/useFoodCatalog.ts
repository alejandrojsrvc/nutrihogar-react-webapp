import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  createCustomFoodUseCase,
  deleteCustomFoodUseCase,
  getFoodDetailUseCase,
  listFoodCategoriesUseCase,
  listFoodNutrientsUseCase,
  searchFoodsUseCase,
  updateCustomFoodUseCase,
} from '../../../../app/composition/dependencies';
import type {
  CustomFoodInput,
  FoodSearchCriteria,
  UpdateCustomFoodInput,
} from '../../application/ports/FoodCatalogGateway';

export const foodCatalogQueryKeys = {
  all: ['food-catalog'] as const,
  categories: () => [...foodCatalogQueryKeys.all, 'categories'] as const,
  nutrients: () => [...foodCatalogQueryKeys.all, 'nutrients'] as const,
  detail: (foodId: string) =>
    [...foodCatalogQueryKeys.all, 'detail', foodId] as const,
  search: (criteria: FoodSearchCriteria) =>
    [...foodCatalogQueryKeys.all, 'search', criteria] as const,
};

export function useFoodCategories() {
  return useQuery({
    queryFn: () => listFoodCategoriesUseCase.execute(),
    queryKey: foodCatalogQueryKeys.categories(),
    retry: false,
  });
}

export function useFoodNutrients() {
  return useQuery({
    queryFn: () => listFoodNutrientsUseCase.execute(),
    queryKey: foodCatalogQueryKeys.nutrients(),
    retry: false,
  });
}

export function useCreateCustomFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ householdId, input }: { householdId: string; input: CustomFoodInput }) =>
      createCustomFoodUseCase.execute(householdId, input),
    onSuccess: (food) => {
      queryClient.setQueryData(foodCatalogQueryKeys.detail(food.id), food);
      return queryClient.invalidateQueries({
        queryKey: foodCatalogQueryKeys.all,
      });
    },
  });
}

export function useUpdateCustomFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ foodId, input }: { foodId: string; input: UpdateCustomFoodInput }) =>
      updateCustomFoodUseCase.execute(foodId, input),
    onSuccess: (food) => {
      queryClient.setQueryData(foodCatalogQueryKeys.detail(food.id), food);
      return queryClient.invalidateQueries({
        queryKey: foodCatalogQueryKeys.all,
      });
    },
  });
}

export function useDeleteCustomFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (foodId: string) => deleteCustomFoodUseCase.execute(foodId),
    onSuccess: (_, foodId) => {
      queryClient.removeQueries({ queryKey: foodCatalogQueryKeys.detail(foodId) });
      return queryClient.invalidateQueries({
        queryKey: foodCatalogQueryKeys.all,
      });
    },
  });
}

export function useFoodSearch(criteria: FoodSearchCriteria) {
  const debouncedQuery = useDebouncedValue(criteria.query ?? '', 350);
  const debouncedCriteria = {
    ...criteria,
    query: debouncedQuery.trim() || undefined,
  };

  return useQuery({
    queryFn: () => searchFoodsUseCase.execute(debouncedCriteria),
    queryKey: foodCatalogQueryKeys.search(debouncedCriteria),
    retry: false,
  });
}

export function useFoodDetail(foodId: string | undefined) {
  return useQuery({
    enabled: Boolean(foodId),
    queryFn: () => getFoodDetailUseCase.execute(foodId as string),
    queryKey: foodId
      ? foodCatalogQueryKeys.detail(foodId)
      : foodCatalogQueryKeys.all,
    retry: false,
  });
}

function useDebouncedValue(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}
