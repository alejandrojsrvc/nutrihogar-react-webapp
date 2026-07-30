export type OnboardingStep =
  | 'create-household'
  | 'select-household'
  | 'complete-profile'
  | 'ready';

export interface ResolveOnboardingStepInput {
  hasActiveHousehold: boolean;
  hasCurrentProfile: boolean;
  householdCount: number;
}

export class ResolveOnboardingStepUseCase {
  execute({
    hasActiveHousehold,
    hasCurrentProfile,
    householdCount,
  }: ResolveOnboardingStepInput): OnboardingStep {
    if (householdCount === 0) {
      return 'create-household';
    }

    if (!hasActiveHousehold) {
      return 'select-household';
    }

    if (!hasCurrentProfile) {
      return 'complete-profile';
    }

    return 'ready';
  }
}
