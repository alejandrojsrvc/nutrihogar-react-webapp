import type {
  HouseholdInvitation,
  HouseholdInvitationGateway,
} from '../ports/HouseholdInvitationGateway';

export class AcceptHouseholdInvitationUseCase {
  constructor(
    private readonly invitationGateway: HouseholdInvitationGateway,
  ) {}

  execute(token: string): Promise<HouseholdInvitation> {
    return this.invitationGateway.accept(token);
  }
}
