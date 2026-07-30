import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdultProfileUseCase,
  listAdultProfilesUseCase,
} from '../../../../app/composition/dependencies';
import type { CreateAdultProfileInput } from '../../application/ports/AdultProfileGateway';

export const adultProfileQueryKeys = {
  all: ['adult-profiles'] as const,
  byHousehold: (householdId: string) =>
    [...adultProfileQueryKeys.all, householdId] as const,
};

export function useAdultProfiles(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId
      ? adultProfileQueryKeys.byHousehold(householdId)
      : adultProfileQueryKeys.all,
    queryFn: () => listAdultProfilesUseCase.execute(householdId as string),
    retry: false,
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateAdultProfileInput) =>
      createAdultProfileUseCase.execute(householdId as string, input),
    onSuccess: () => {
      if (householdId) {
        void queryClient.invalidateQueries({
          queryKey: adultProfileQueryKeys.byHousehold(householdId),
        });
      }
    },
  });

  return {
    ...query,
    createAdultProfile: createMutation.mutateAsync,
    createAdultProfileError: createMutation.error,
    isCreatingAdultProfile: createMutation.isPending,
    profiles: query.data ?? [],
  };
}
