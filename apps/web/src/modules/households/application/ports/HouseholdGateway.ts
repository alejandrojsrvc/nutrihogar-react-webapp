export interface Household {
  id: string;
  name: string;
  timezone: string;
  currency: string;
}

export interface CreateHouseholdInput {
  name: string;
  timezone: string;
  currency: string;
}

export interface HouseholdGateway {
  list(): Promise<Household[]>;
  create(input: CreateHouseholdInput): Promise<Household>;
}
