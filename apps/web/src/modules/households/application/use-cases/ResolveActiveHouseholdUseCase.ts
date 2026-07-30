import type { ActiveHouseholdGateway } from '../ports/ActiveHouseholdGateway';
import type { Household } from '../ports/HouseholdGateway';

export class ResolveActiveHouseholdUseCase {
  constructor(private readonly activeHouseholdGateway: ActiveHouseholdGateway) {}

  execute(households: Household[]): Household | null {
    const storedHouseholdId = this.activeHouseholdGateway.get();
    const storedHousehold = households.find(
      (household) => household.id === storedHouseholdId,
    );

    if (storedHousehold) {
      return storedHousehold;
    }

    if (households.length === 1) {
      this.activeHouseholdGateway.set(households[0].id);
      return households[0];
    }

    this.activeHouseholdGateway.clear();
    return null;
  }
}
