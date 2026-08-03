import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addShoppingListItemUseCase,
  convertShoppingListToPurchaseUseCase,
  generateShoppingListUseCase,
  loadShoppingListUseCase,
  markShoppingListItemPurchasedUseCase,
  removeShoppingListItemUseCase,
  updateShoppingListItemUseCase,
} from '../../../../app/composition/dependencies';
import type { PurchaseInput } from '../../../purchases/application/ports/PurchaseGateway';
import type { ShoppingListItemInput } from '../../application/ports/ShoppingListGateway';

export const shoppingListQueryKeys = {
  all: ['shopping-list'] as const,
  household: (householdId: string) =>
    [...shoppingListQueryKeys.all, householdId] as const,
};

export function useShoppingList(householdId: string | undefined) {
  return useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId
      ? shoppingListQueryKeys.household(householdId)
      : shoppingListQueryKeys.all,
    queryFn: () => loadShoppingListUseCase.execute(householdId as string),
    retry: false,
  });
}

function useShoppingListMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKeys.all }),
  });
}

export function useAddShoppingListItem() {
  return useShoppingListMutation(
    ({
      householdId,
      input,
    }: {
      householdId: string;
      input: ShoppingListItemInput;
    }) => addShoppingListItemUseCase.execute(householdId, input),
  );
}

export function useUpdateShoppingListItem() {
  return useShoppingListMutation(
    ({
      itemId,
      input,
    }: {
      itemId: string;
      input: Partial<ShoppingListItemInput>;
    }) => updateShoppingListItemUseCase.execute(itemId, input),
  );
}

export function useRemoveShoppingListItem() {
  return useShoppingListMutation((itemId: string) =>
    removeShoppingListItemUseCase.execute(itemId),
  );
}

export function useMarkShoppingListItemPurchased() {
  return useShoppingListMutation((itemId: string) =>
    markShoppingListItemPurchasedUseCase.execute(itemId),
  );
}

export function useGenerateShoppingList() {
  return useShoppingListMutation((householdId: string) =>
    generateShoppingListUseCase.execute(householdId),
  );
}

export function useConvertShoppingListToPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdId,
      input,
    }: {
      householdId: string;
      input: PurchaseInput & { itemIds: string[]; idempotencyKey?: string };
    }) => convertShoppingListToPurchaseUseCase.execute(householdId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: shoppingListQueryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['purchases'] });
      void queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
