import type {
  CreateHouseholdInput,
  Household,
  HouseholdGateway,
} from '../ports/HouseholdGateway';

export class CreateHouseholdUseCase {
  constructor(private readonly householdGateway: HouseholdGateway) {}

  execute(input: CreateHouseholdInput): Promise<Household> {
    return this.householdGateway.create(input);
  }
}
