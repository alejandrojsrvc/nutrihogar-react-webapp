export interface ActiveHouseholdGateway {
  get(): string | null;
  set(householdId: string): void;
  clear(): void;
}
