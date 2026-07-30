import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptHouseholdInvitationUseCase,
  createHouseholdInvitationUseCase,
  listHouseholdInvitationsUseCase,
} from '../../../../app/composition/dependencies';
import type { CreateHouseholdInvitationInput } from '../../application/ports/HouseholdInvitationGateway';
import { householdQueryKeys } from './useHouseholds';

export const householdInvitationQueryKeys = {
  all: ['household-invitations'] as const,
  byHousehold: (householdId: string) =>
    [...householdInvitationQueryKeys.all, householdId] as const,
};

export function useHouseholdInvitations(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    enabled: Boolean(householdId),
    queryKey: householdId
      ? householdInvitationQueryKeys.byHousehold(householdId)
      : householdInvitationQueryKeys.all,
    queryFn: () =>
      listHouseholdInvitationsUseCase.execute(householdId as string),
    retry: false,
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateHouseholdInvitationInput) =>
      createHouseholdInvitationUseCase.execute(householdId as string, input),
    onSuccess: () => {
      if (householdId) {
        void queryClient.invalidateQueries({
          queryKey: householdInvitationQueryKeys.byHousehold(householdId),
        });
      }
    },
  });

  return {
    ...query,
    createInvitation: createMutation.mutateAsync,
    createInvitationError: createMutation.error,
    createdInvitation: createMutation.data,
    invitations: query.data ?? [],
    isCreatingInvitation: createMutation.isPending,
  };
}

export function useAcceptHouseholdInvitation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (token: string) =>
      acceptHouseholdInvitationUseCase.execute(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: householdQueryKeys.all });
    },
  });

  return {
    acceptInvitation: mutation.mutateAsync,
    acceptedInvitation: mutation.data,
    error: mutation.error,
    isAccepting: mutation.isPending,
  };
}
