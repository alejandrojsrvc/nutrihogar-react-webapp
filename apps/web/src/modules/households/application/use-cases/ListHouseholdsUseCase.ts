import type {
  Household,
  HouseholdGateway,
} from '../ports/HouseholdGateway';

export class ListHouseholdsUseCase {
  constructor(private readonly householdGateway: HouseholdGateway) {}

  execute(): Promise<Household[]> {
    return this.householdGateway.list();
  }
}
