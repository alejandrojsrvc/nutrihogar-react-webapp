import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  acceptHouseholdInvitationUseCase,
  createHouseholdInvitationUseCase,
  getHouseholdInvitationTokenUseCase,
  listHouseholdInvitationsUseCase,
  rememberHouseholdInvitationTokenUseCase,
} from '../../../../app/composition/dependencies';
import type {
  CreateHouseholdInvitationInput,
  HouseholdInvitation,
} from '../../application/ports/HouseholdInvitationGateway';
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
    onSuccess: (invitation) => {
      if (invitation.token) {
        rememberHouseholdInvitationTokenUseCase.execute(
          invitation.id,
          invitation.token,
        );
      }

      if (householdId) {
        void queryClient.invalidateQueries({
          queryKey: householdInvitationQueryKeys.byHousehold(householdId),
        });
      }
    },
  });
  const invitations = useMemo(
    () =>
      (query.data ?? []).map((invitation) =>
        withRememberedToken(invitation),
      ),
    [query.data],
  );
  const createdInvitation = createMutation.data
    ? withRememberedToken(createMutation.data)
    : undefined;

  return {
    ...query,
    createInvitation: createMutation.mutateAsync,
    createInvitationError: createMutation.error,
    createdInvitation,
    invitations,
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

function withRememberedToken(
  invitation: HouseholdInvitation,
): HouseholdInvitation {
  return invitation.token
    ? invitation
    : {
        ...invitation,
        token:
          getHouseholdInvitationTokenUseCase.execute(invitation.id) ??
          undefined,
      };
}
