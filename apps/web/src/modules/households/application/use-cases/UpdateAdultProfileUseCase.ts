import type {
  AdultProfile,
  AdultProfileGateway,
  UpdateAdultProfileInput,
} from '../ports/AdultProfileGateway';

export class UpdateAdultProfileUseCase {
  constructor(private readonly adultProfileGateway: AdultProfileGateway) {}

  execute(
    profileId: string,
    input: UpdateAdultProfileInput,
  ): Promise<AdultProfile> {
    return this.adultProfileGateway.update(profileId, input);
  }
}
