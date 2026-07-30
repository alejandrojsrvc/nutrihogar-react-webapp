import type {
  AdultProfile,
  AdultProfileGateway,
  CreateAdultProfileInput,
} from '../ports/AdultProfileGateway';

export class CreateAdultProfileUseCase {
  constructor(private readonly adultProfileGateway: AdultProfileGateway) {}

  execute(
    householdId: string,
    input: CreateAdultProfileInput,
  ): Promise<AdultProfile> {
    return this.adultProfileGateway.create(householdId, input);
  }
}
