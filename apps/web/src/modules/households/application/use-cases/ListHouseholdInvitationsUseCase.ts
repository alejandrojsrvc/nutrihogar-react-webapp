import type {
  HouseholdInvitation,
  HouseholdInvitationGateway,
} from '../ports/HouseholdInvitationGateway';

export class ListHouseholdInvitationsUseCase {
  constructor(
    private readonly invitationGateway: HouseholdInvitationGateway,
  ) {}

  execute(householdId: string): Promise<HouseholdInvitation[]> {
    return this.invitationGateway.list(householdId);
  }
}
