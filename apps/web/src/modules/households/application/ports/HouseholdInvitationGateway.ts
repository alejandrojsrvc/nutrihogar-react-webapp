export type HouseholdInvitationRole = 'ADMIN' | 'MEMBER';
export type HouseholdInvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface HouseholdInvitation {
  id: string;
  householdId: string;
  email: string;
  role: HouseholdInvitationRole;
  status: HouseholdInvitationStatus;
  expiresAt: string;
  invitedById: string;
  acceptedById: string | null;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

export interface CreateHouseholdInvitationInput {
  email: string;
  role: HouseholdInvitationRole;
}

export interface HouseholdInvitationGateway {
  list(householdId: string): Promise<HouseholdInvitation[]>;
  create(
    householdId: string,
    input: CreateHouseholdInvitationInput,
  ): Promise<HouseholdInvitation>;
  accept(token: string): Promise<HouseholdInvitation>;
}
