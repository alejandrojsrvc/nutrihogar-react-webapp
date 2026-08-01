export const householdInvitationQueryKeys = {
  all: ['household-invitations'] as const,
  byHousehold: (householdId: string) =>
    [...householdInvitationQueryKeys.all, householdId] as const,
};
