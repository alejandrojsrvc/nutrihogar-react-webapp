import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelPurchaseUseCase,
  confirmPurchaseUseCase,
  createPurchaseUseCase,
  listPurchasesUseCase,
  loadPurchaseUseCase,
  updatePurchaseUseCase,
} from '../../../../app/composition/dependencies';
import type { PurchaseInput, PurchaseFilters } from '../../application/ports/PurchaseGateway';

export const purchaseQueryKeys = {
  all: ['purchases'] as const,
  detail: (purchaseId: string) => [...purchaseQueryKeys.all, 'detail', purchaseId] as const,
  list: (householdId: string, filters: PurchaseFilters = {}) => [...purchaseQueryKeys.all, 'list', householdId, filters] as const,
};

export function usePurchases(householdId: string | undefined, filters: PurchaseFilters = {}) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId ? purchaseQueryKeys.list(householdId, filters) : purchaseQueryKeys.all,
    queryFn: () => listPurchasesUseCase.execute(householdId as string, filters),
    retry: false,
  });
}

export function usePurchase(purchaseId: string | undefined) {
  return useQuery({
    enabled: Boolean(purchaseId),
    queryKey: purchaseId ? purchaseQueryKeys.detail(purchaseId) : purchaseQueryKeys.all,
    queryFn: () => loadPurchaseUseCase.execute(purchaseId as string),
    retry: false,
  });
}

function usePurchaseMutation<TInput>(mutationFn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseQueryKeys.all }),
  });
}

export function useCreatePurchase() {
  return usePurchaseMutation(({ householdId, input }: { householdId: string; input: PurchaseInput }) => createPurchaseUseCase.execute(householdId, input));
}

export function useUpdatePurchase() {
  return usePurchaseMutation(({ purchaseId, input }: { purchaseId: string; input: Partial<PurchaseInput> }) => updatePurchaseUseCase.execute(purchaseId, input));
}

export function useConfirmPurchase() {
  return usePurchaseMutation((purchaseId: string) => confirmPurchaseUseCase.execute(purchaseId));
}

export function useCancelPurchase() {
  return usePurchaseMutation((purchaseId: string) => cancelPurchaseUseCase.execute(purchaseId));
}
