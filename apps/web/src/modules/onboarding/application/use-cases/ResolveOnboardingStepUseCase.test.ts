import { describe, expect, it } from 'vitest';

import { ResolveOnboardingStepUseCase } from './ResolveOnboardingStepUseCase';

describe('ResolveOnboardingStepUseCase', () => {
  const useCase = new ResolveOnboardingStepUseCase();

  it('starts with household creation for a new user', () => {
    expect(
      useCase.execute({
        hasActiveHousehold: false,
        hasCurrentProfile: false,
        householdCount: 0,
      }),
    ).toBe('create-household');
  });

  it('asks the user to select one of several households', () => {
    expect(
      useCase.execute({
        hasActiveHousehold: false,
        hasCurrentProfile: false,
        householdCount: 2,
      }),
    ).toBe('select-household');
  });

  it('continues with the adult profile when the active household has none', () => {
    expect(
      useCase.execute({
        hasActiveHousehold: true,
        hasCurrentProfile: false,
        householdCount: 1,
      }),
    ).toBe('complete-profile');
  });

  it('opens the app when the current profile is complete', () => {
    expect(
      useCase.execute({
        hasActiveHousehold: true,
        hasCurrentProfile: true,
        householdCount: 1,
      }),
    ).toBe('ready');
  });
});
