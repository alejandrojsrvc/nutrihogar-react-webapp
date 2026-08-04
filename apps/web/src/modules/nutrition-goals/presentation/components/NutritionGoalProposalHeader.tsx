import { Target } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useNutritionGoalSuggestion } from '../hooks/useNutritionGoals';

export function NutritionGoalProposalHeader() {
  const { profileId } = useParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const suggestion = useNutritionGoalSuggestion(profileId);
  const profile = profiles.profiles.find((item) => item.id === profileId);

  if (
    suggestion.isPending ||
    households.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return (
      <PageHeader
        icon={<Target size={22} />}
        title="Revisa tu estimación"
        titleId="goal-proposal-title"
      />
    );
  }

  if (households.isError || !households.activeHousehold || profiles.isError) {
    return (
      <PageHeader
        icon={<Target size={22} />}
        title="No pudimos cargar el perfil"
        titleId="goal-proposal-profiles-error-title"
      />
    );
  }

  if (!suggestion.data || !profileId) {
    return (
      <PageHeader
        icon={<Target size={22} />}
        title="La propuesta ya no está disponible"
        titleId="goal-proposal-missing-title"
      />
    );
  }

  if (!profile) {
    return (
      <PageHeader
        icon={<Target size={22} />}
        title="No encontramos este perfil"
        titleId="goal-proposal-profile-missing-title"
      />
    );
  }

  return (
    <PageHeader
      description={`Revisa la estimación para ${profile.name} antes de guardarla.`}
      icon={<Target size={22} />}
      title="Revisa tu estimación"
      titleId="goal-proposal-title"
    />
  );
}
