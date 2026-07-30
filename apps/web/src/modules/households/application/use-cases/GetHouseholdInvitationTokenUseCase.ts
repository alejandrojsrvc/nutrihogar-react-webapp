import type { HouseholdInvitationLinkGateway } from '../ports/HouseholdInvitationLinkGateway';

export class GetHouseholdInvitationTokenUseCase {
  constructor(
    private readonly invitationLinkGateway: HouseholdInvitationLinkGateway,
  ) {}

  execute(invitationId: string): string | null {
    return this.invitationLinkGateway.getToken(invitationId);
  }
}
