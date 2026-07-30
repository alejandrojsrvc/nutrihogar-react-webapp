export interface HouseholdInvitationLinkGateway {
  getToken(invitationId: string): string | null;
  saveToken(invitationId: string, token: string): void;
}
