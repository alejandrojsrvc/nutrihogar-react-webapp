import type { ActiveHouseholdGateway } from '../ports/ActiveHouseholdGateway';
import type { Household } from '../ports/HouseholdGateway';

export class SelectActiveHouseholdUseCase {
  constructor(private readonly activeHouseholdGateway: ActiveHouseholdGateway) {}

  execute(household: Household): void {
    this.activeHouseholdGateway.set(household.id);
  }
}
