import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPreparedFoodLeftoverUseCase,
  getPreparedFoodLeftoverUseCase,
  listPreparedFoodLeftoversUseCase,
  updatePreparedFoodLeftoverStatusUseCase,
  addPreparedFoodLeftoverToInventoryUseCase,
} from '../../../../app/composition/dependencies';
import type {
  CreatePreparedFoodLeftoverInput,
  PreparedFoodLeftoverStatus,
} from '../../application/ports/PreparedFoodLeftoverGateway';

export const preparedFoodLeftoverQueryKeys = {
  all: ['prepared-food-leftovers'] as const,
  byHousehold: (householdId: string) => [...preparedFoodLeftoverQueryKeys.all, householdId] as const,
  detail: (leftoverId: string) => [...preparedFoodLeftoverQueryKeys.all, 'detail', leftoverId] as const,
};

export function usePreparedFoodLeftovers(householdId: string | undefined) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId ? preparedFoodLeftoverQueryKeys.byHousehold(householdId) : preparedFoodLeftoverQueryKeys.all,
    queryFn: () => listPreparedFoodLeftoversUseCase.execute(householdId as string),
    retry: false,
  });
}

export function usePreparedFoodLeftover(leftoverId: string | undefined) {
  return useQuery({
    enabled: Boolean(leftoverId),
    queryKey: leftoverId ? preparedFoodLeftoverQueryKeys.detail(leftoverId) : preparedFoodLeftoverQueryKeys.all,
    queryFn: () => getPreparedFoodLeftoverUseCase.execute(leftoverId as string),
    retry: false,
  });
}

export function useCreatePreparedFoodLeftover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, input }: { batchId: string; input: CreatePreparedFoodLeftoverInput }) =>
      createPreparedFoodLeftoverUseCase.execute(batchId, input),
    onSuccess: (leftover) => {
      queryClient.setQueryData(preparedFoodLeftoverQueryKeys.detail(leftover.id), leftover);
      void queryClient.invalidateQueries({ queryKey: preparedFoodLeftoverQueryKeys.all });
    },
  });
}

export function useUpdatePreparedFoodLeftoverStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leftoverId, status }: { leftoverId: string; status: PreparedFoodLeftoverStatus }) =>
      updatePreparedFoodLeftoverStatusUseCase.execute(leftoverId, status),
    onSuccess: (leftover) => {
      queryClient.setQueryData(preparedFoodLeftoverQueryKeys.detail(leftover.id), leftover);
      void queryClient.invalidateQueries({ queryKey: preparedFoodLeftoverQueryKeys.all });
    },
  });
}

export function useAddPreparedFoodLeftoverToInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leftoverId: string) => addPreparedFoodLeftoverToInventoryUseCase.execute(leftoverId),
    onSuccess: (_, leftoverId) => {
      void queryClient.invalidateQueries({ queryKey: preparedFoodLeftoverQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['inventory'] });
      void queryClient.invalidateQueries({ queryKey: preparedFoodLeftoverQueryKeys.detail(leftoverId) });
    },
  });
}
