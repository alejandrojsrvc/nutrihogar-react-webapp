import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import {
  createHouseholdUseCase,
  listHouseholdsUseCase,
  resolveActiveHouseholdUseCase,
  selectActiveHouseholdUseCase,
} from '../../../../app/composition/dependencies';
import type {
  CreateHouseholdInput,
  Household,
} from '../../application/ports/HouseholdGateway';

export const householdQueryKeys = {
  all: ['households'] as const,
};

export function useHouseholds() {
  const queryClient = useQueryClient();
  const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(
    null,
  );
  const householdsQuery = useQuery({
    queryKey: householdQueryKeys.all,
    queryFn: () => listHouseholdsUseCase.execute(),
    retry: false,
  });
  const resolvedActiveHousehold = useMemo(() => {
    if (!householdsQuery.data) {
      return null;
    }

    return resolveActiveHouseholdUseCase.execute(householdsQuery.data);
  }, [householdsQuery.data]);

  const createMutation = useMutation({
    mutationFn: (input: CreateHouseholdInput) =>
      createHouseholdUseCase.execute(input),
    onSuccess: (createdHousehold) => {
      selectActiveHouseholdUseCase.execute(createdHousehold);
      setActiveHouseholdId(createdHousehold.id);
      queryClient.setQueryData<Household[]>(householdQueryKeys.all, (current) =>
        current ? [...current, createdHousehold] : [createdHousehold],
      );
    },
  });

  const selectActiveHousehold = useCallback((household: Household) => {
    selectActiveHouseholdUseCase.execute(household);
    setActiveHouseholdId(household.id);
  }, []);

  const activeHousehold = useMemo(
    () =>
      householdsQuery.data?.find(
        (household) => household.id === activeHouseholdId,
      ) ?? resolvedActiveHousehold,
    [activeHouseholdId, householdsQuery.data, resolvedActiveHousehold],
  );

  return {
    activeHousehold,
    activeHouseholdId: activeHousehold?.id ?? null,
    createHousehold: createMutation.mutateAsync,
    createHouseholdError: createMutation.error,
    isCreatingHousehold: createMutation.isPending,
    selectActiveHousehold,
    ...householdsQuery,
    households: householdsQuery.data ?? [],
  };
}
