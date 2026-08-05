import { UserRound } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useAuth } from '../../../auth/presentation/providers/useAuth';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import { useHouseholds } from '../hooks/useHouseholds';

export function AdultProfileOverviewHeader() {
  const { currentUser, isCurrentUserLoading } = useAuth();
  const { profileId } = useRouteParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const householdName = households.activeHousehold?.name;

  if (
    households.isPending ||
    isCurrentUserLoading ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return (
      <PageHeader
        eyebrow={householdName}
        icon={<UserRound size={24} />}
        title="Tu perfil"
        titleId="profile-overview-title"
        description="Consulta los datos disponibles de este integrante del hogar."
      />
    );
  }

  if (!households.activeHousehold) {
    return (
      <PageHeader
        description="Elige el hogar cuyos datos quieres consultar."
        icon={<UserRound size={24} />}
        title="Selecciona un hogar"
        titleId="profile-household-title"
      />
    );
  }

  const profile = currentUser
    ? profiles.profiles.find((item) =>
        profileId ? item.id === profileId : item.userId === currentUser.id,
      )
    : undefined;

  if (!profile && profileId) {
    return (
      <PageHeader
        description="Este integrante no pertenece al hogar activo o ya no está disponible."
        eyebrow={householdName}
        icon={<UserRound size={24} />}
        title="Perfil no disponible"
        titleId="profile-empty-title"
      />
    );
  }

  if (!profile) {
    return (
      <PageHeader
        description="Configura tus datos para personalizar las metas y recomendaciones del hogar."
        eyebrow={householdName}
        icon={<UserRound size={24} />}
        title="Tu perfil"
        titleId="profile-empty-title"
      />
    );
  }

  const isOwnProfile = profile.userId === currentUser?.id;

  return (
    <PageHeader
      description="Consulta los datos disponibles de este integrante del hogar."
      eyebrow={householdName}
      icon={<UserRound size={24} />}
      title={isOwnProfile ? 'Tu perfil' : profile.name}
      titleId="profile-overview-title"
    />
  );
}
