import type {
  AdultProfile,
  AdultProfileGateway,
} from '../ports/AdultProfileGateway';

export class ListAdultProfilesUseCase {
  constructor(private readonly adultProfileGateway: AdultProfileGateway) {}

  execute(householdId: string): Promise<AdultProfile[]> {
    return this.adultProfileGateway.list(householdId);
  }
}
