export type BiologicalSex = 'MALE' | 'FEMALE';
export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHT'
  | 'MODERATE'
  | 'HIGH'
  | 'VERY_HIGH';
export type PrimaryGoal = 'FAT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN';

export interface DietaryRestriction {
  id: string;
  name: string;
  type: 'ALLERGY' | 'INTOLERANCE' | 'PREFERENCE';
}

export interface AdultProfile {
  id: string;
  householdId: string;
  userId: string;
  name: string;
  birthDate: string;
  age: number;
  biologicalSex: BiologicalSex;
  heightCm: number;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  hasKitchenScale: boolean;
  dietaryRestrictions: DietaryRestriction[];
}

export interface CreateAdultProfileInput {
  name: string;
  birthDate: string;
  biologicalSex: BiologicalSex;
  heightCm: number;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  hasKitchenScale: boolean;
}

export interface AdultProfileGateway {
  list(householdId: string): Promise<AdultProfile[]>;
  create(
    householdId: string,
    input: CreateAdultProfileInput,
  ): Promise<AdultProfile>;
}
