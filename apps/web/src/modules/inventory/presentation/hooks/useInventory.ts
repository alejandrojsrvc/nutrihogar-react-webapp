import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  loadInventoryUseCase,
  getInventorySyncStatusUseCase,
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
    queryFn: () => loadInventoryUseCase.execute(householdId as string, filters),
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

export function useInventorySyncStatus(householdId: string | undefined) {
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId ? [...inventoryQueryKeys.household(householdId), 'sync-status'] : [...inventoryQueryKeys.all, 'sync-status'],
    queryFn: async () => ({ ...(await getInventorySyncStatusUseCase.execute(householdId as string)), isOnline }),
    retry: false,
  });
}
