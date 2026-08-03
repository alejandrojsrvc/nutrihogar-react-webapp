import type {
  CreateHouseholdInvitationInput,
  HouseholdInvitation,
  HouseholdInvitationGateway,
} from '../ports/HouseholdInvitationGateway';

export class CreateHouseholdInvitationUseCase {
  constructor(private readonly invitationGateway: HouseholdInvitationGateway) {}

  execute(
    householdId: string,
    input: CreateHouseholdInvitationInput,
  ): Promise<HouseholdInvitation> {
    return this.invitationGateway.create(householdId, input);
  }
}
