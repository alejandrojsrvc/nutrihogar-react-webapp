import type { HouseholdInvitationLinkGateway } from '../ports/HouseholdInvitationLinkGateway';

export class RememberHouseholdInvitationTokenUseCase {
  constructor(
    private readonly invitationLinkGateway: HouseholdInvitationLinkGateway,
  ) {}

  execute(invitationId: string, token: string): void {
    this.invitationLinkGateway.saveToken(invitationId, token);
  }
}
