import { useMemo } from 'react';

import { resolveOnboardingStepUseCase } from '../../../../app/composition/dependencies';
import { useAuth } from '../../../auth/presentation/providers/useAuth';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function useOnboardingStatus() {
  const auth = useAuth();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const currentProfile = useMemo(
    () =>
      auth.currentUser
        ? profiles.profiles.find(
            (profile) => profile.userId === auth.currentUser?.id,
          )
        : undefined,
    [auth.currentUser, profiles.profiles],
  );
  const isProfileLoading =
    Boolean(households.activeHousehold) && profiles.isPending;
  const isLoading =
    auth.isCurrentUserLoading || households.isPending || isProfileLoading;
  const error = auth.error ?? households.error ?? profiles.error;
  const isError = Boolean(error);
  const step = resolveOnboardingStepUseCase.execute({
    hasActiveHousehold: Boolean(households.activeHousehold),
    hasCurrentProfile: Boolean(currentProfile),
    householdCount: households.households.length,
  });

  return {
    auth,
    currentProfile,
    error,
    households,
    isError,
    isLoading,
    profiles,
    step,
  };
}
