import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archiveInventoryItemUseCase,
  consumeInventoryItemUseCase,
  loadInventoryUseCase,
  getInventorySyncStatusUseCase,
  listInventoryMovementsUseCase,
  listPendingInventoryOperationsUseCase,
  synchronizeInventoryUseCase,
  updateInventoryItemUseCase,
  wasteInventoryItemUseCase,
  adjustInventoryItemUseCase,
  createManualInventoryItemUseCase,
  getInventoryItemUseCase,
} from '../../../../app/composition/dependencies';
import type { InventoryFilters, InventoryItem } from '../../domain/Inventory';
import type {
  AdjustInventoryItemInput,
  ConsumeInventoryItemInput,
  CreateManualInventoryItemInput,
  UpdateInventoryItemInput,
} from '../../application/ports/InventoryGateway';

export const inventoryQueryKeys = {
  all: ['inventory'] as const,
  household: (householdId: string, filters: InventoryFilters = {}) =>
    [...inventoryQueryKeys.all, householdId, filters] as const,
  detail: (inventoryItemId: string) => [...inventoryQueryKeys.all, 'detail', inventoryItemId] as const,
  movements: (inventoryItemId: string) => [...inventoryQueryKeys.all, 'movements', inventoryItemId] as const,
  pending: (householdId: string) => [...inventoryQueryKeys.all, 'pending', householdId] as const,
};

export function useInventory(householdId: string | undefined, filters: InventoryFilters = {}) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId ? inventoryQueryKeys.household(householdId, filters) : inventoryQueryKeys.all,
    queryFn: () => loadInventoryUseCase.execute(householdId as string, filters),
    retry: false,
  });
}

export function useInventoryItem(inventoryItemId: string | undefined) {
  return useQuery({
    enabled: Boolean(inventoryItemId),
    queryKey: inventoryItemId ? inventoryQueryKeys.detail(inventoryItemId) : inventoryQueryKeys.all,
    queryFn: () => getInventoryItemUseCase.execute(inventoryItemId as string),
    retry: false,
  });
}

export function useInventoryMovements(inventoryItemId: string | undefined) {
  return useQuery({
    enabled: Boolean(inventoryItemId),
    queryKey: inventoryItemId ? inventoryQueryKeys.movements(inventoryItemId) : inventoryQueryKeys.all,
    queryFn: () => listInventoryMovementsUseCase.execute(inventoryItemId as string),
    retry: false,
  });
}

export function usePendingInventoryOperations(householdId: string | undefined) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId ? inventoryQueryKeys.pending(householdId) : inventoryQueryKeys.all,
    queryFn: () => listPendingInventoryOperationsUseCase.execute(householdId as string),
    retry: false,
  });
}

function useInventoryMutation<TInput>(
  mutationFn: (input: TInput) => Promise<InventoryItem | void>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
  });
}

export function useCreateInventoryItem() {
  return useInventoryMutation(({ householdId, input }: { householdId: string; input: CreateManualInventoryItemInput }) => createManualInventoryItemUseCase.execute(householdId, input));
}

export function useAdjustInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, item, input }: { householdId: string; item: InventoryItem; input: AdjustInventoryItemInput }) => adjustInventoryItemUseCase.execute(householdId, item, input),
    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData(inventoryQueryKeys.detail(variables.item.id), updatedItem);
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.household(variables.householdId) });
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.pending(variables.householdId) });
    },
  });
}

export function useConsumeInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, item, input }: { householdId: string; item: InventoryItem; input: ConsumeInventoryItemInput }) => consumeInventoryItemUseCase.execute(householdId, item, input),
    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData(inventoryQueryKeys.detail(variables.item.id), updatedItem);
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
  });
}

export function useWasteInventoryItem() {
  return useInventoryMutation(({ itemId, input }: { itemId: string; input: ConsumeInventoryItemInput }) => wasteInventoryItemUseCase.execute(itemId, input));
}

export function useUpdateInventoryItem() {
  return useInventoryMutation(({ itemId, input }: { itemId: string; input: UpdateInventoryItemInput }) => updateInventoryItemUseCase.execute(itemId, input));
}

export function useArchiveInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => archiveInventoryItemUseCase.execute(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
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
