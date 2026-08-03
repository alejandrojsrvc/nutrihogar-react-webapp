export type BiologicalSex = 'MALE' | 'FEMALE';
export type ActivityLevel =
  'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type PrimaryGoal = 'FAT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN';
export type DietaryRestrictionType = 'ALLERGY' | 'INTOLERANCE' | 'PREFERENCE';

export interface DietaryRestriction {
  id: string;
  name: string;
  type: DietaryRestrictionType;
  severity: string | null;
  notes: string | null;
}

export interface AdultProfile {
  id: string;
  householdId: string;
  userId: string;
  name: string;
  birthDate: string;
  age: number;
  biologicalSex: BiologicalSex;
  weightKg?: number | null;
  heightCm: number;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  hasKitchenScale: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dietaryRestrictions: DietaryRestriction[];
}

export interface DietaryRestrictionInput {
  type: DietaryRestrictionType;
  name: string;
  severity?: string | null;
  notes?: string | null;
}

export interface CreateAdultProfileInput {
  name: string;
  birthDate: string;
  biologicalSex: BiologicalSex;
  weightKg?: number | null;
  heightCm: number;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  hasKitchenScale: boolean;
  dietaryRestrictions: DietaryRestrictionInput[];
}

export type UpdateAdultProfileInput = Partial<CreateAdultProfileInput>;

export interface AdultProfileGateway {
  list(householdId: string): Promise<AdultProfile[]>;
  create(
    householdId: string,
    input: CreateAdultProfileInput,
  ): Promise<AdultProfile>;
  update(
    profileId: string,
    input: UpdateAdultProfileInput,
  ): Promise<AdultProfile>;
}
