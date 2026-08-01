import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  loadInventoryUseCase,
  synchronizeInventoryUseCase,
} from '../../../../app/composition/dependencies';
import type { InventoryFilters } from '../../domain/Inventory';

export const inventoryQueryKeys = {
  all: ['inventory'] as const,
  household: (householdId: string, filters: InventoryFilters = {}) =>
    [...inventoryQueryKeys.all, householdId, filters] as const,
};

export function useInventory(householdId: string | undefined, filters: InventoryFilters = {}) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId ? inventoryQueryKeys.household(householdId, filters) : inventoryQueryKeys.all,
    queryFn: () => loadInventoryUseCase.execute(householdId as string),
    retry: false,
  });
}

export function useSynchronizeInventory(householdId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => synchronizeInventoryUseCase.execute(householdId as string),
    onSuccess: () => {
      if (householdId) void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.household(householdId) });
    },
  });
}
