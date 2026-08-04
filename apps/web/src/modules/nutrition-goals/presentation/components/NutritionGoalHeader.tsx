import { Target } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useCurrentNutritionGoal } from '../hooks/useNutritionGoals';

export function NutritionGoalHeader() {
  const { profileId } = useRouteParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const profile = profiles.profiles.find((item) => item.id === profileId);
  const currentGoal = useCurrentNutritionGoal(profileId);

  if (
    !profileId ||
    households.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending) ||
    (Boolean(households.activeHousehold) && currentGoal.isPending)
  ) {
    return (
      <PageHeader icon={<Target size={22} />} title="Meta nutricional" />
    );
  }

  if (households.isError || !households.activeHousehold || profiles.isError) {
    return (
      <PageHeader
        icon={<Target size={22} />}
        title="No pudimos cargar los perfiles"
        titleId="goal-profiles-error-title"
      />
    );
  }

  if (!profile) {
    return (
      <PageHeader
        icon={<Target size={22} />}
        title="No encontramos este perfil"
        titleId="goal-profile-error"
      />
    );
  }

  if (currentGoal.isError) {
    return (
      <PageHeader
        icon={<Target size={22} />}
        title="No pudimos cargar la meta nutricional"
        titleId="goal-error-title"
      />
    );
  }

  if (currentGoal.data) {
    return (
      <PageHeader
        description={`Referencia diaria vigente para ${profile.name}.`}
        icon={<Target size={22} />}
        title="Meta nutricional"
        titleId="current-goal-title"
      />
    );
  }

  return (
    <PageHeader
      description="Usaremos los datos de tu perfil para preparar una estimación que podrás revisar antes de confirmarla."
      icon={<Target size={22} />}
      title={`Configura la meta de ${profile.name}`}
      titleId="goal-start-title"
    />
  );
}
