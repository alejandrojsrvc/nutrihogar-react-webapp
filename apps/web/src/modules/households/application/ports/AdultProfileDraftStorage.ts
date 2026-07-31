import type { DietaryRestrictionType } from './AdultProfileGateway';

export interface AdultProfileDraftRestriction {
  name: string;
  notes: string;
  severity: string;
  type: DietaryRestrictionType;
}

export interface AdultProfileDraftValues {
  activityLevel: string;
  birthDate: string;
  biologicalSex: string;
  dietaryRestrictions: AdultProfileDraftRestriction[];
  hasKitchenScale: boolean;
  weightKg: string;
  heightCm: string;
  name: string;
  primaryGoal: string;
}

export interface AdultProfileDraft {
  currentStep: number;
  values: AdultProfileDraftValues;
}

export interface AdultProfileDraftStorage {
  clear(key: string): void;
  get(key: string): AdultProfileDraft | null;
  save(key: string, draft: AdultProfileDraft): void;
}
