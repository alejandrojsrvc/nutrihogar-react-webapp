import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  getFoodDetailUseCase,
  listFoodCategoriesUseCase,
  searchFoodsUseCase,
} from '../../../../app/composition/dependencies';
import type {
  FoodSearchCriteria,
} from '../../application/ports/FoodCatalogGateway';

export const foodCatalogQueryKeys = {
  all: ['food-catalog'] as const,
  categories: () => [...foodCatalogQueryKeys.all, 'categories'] as const,
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
