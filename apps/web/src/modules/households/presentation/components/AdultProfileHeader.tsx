import { UserRoundPen } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAuth } from '../../../auth/presentation/providers/useAuth';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import { useHouseholds } from '../hooks/useHouseholds';

export function AdultProfileHeader() {
  const { currentUser, isCurrentUserLoading } = useAuth();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const householdName = households.activeHousehold?.name;
  const currentProfile = currentUser
    ? profiles.profiles.find(
        (profile) => profile.userId === currentUser.id,
      )
    : undefined;

  if (
    households.isPending ||
    isCurrentUserLoading ||
    !currentUser ||
    households.isError ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return (
      <PageHeader
        icon={<UserRoundPen size={24} />}
        title="Configura tu perfil"
        titleId="profile-title"
        description="Completa estos pasos para adaptar la experiencia a tus necesidades."
      />
    );
  }

  if (!households.activeHousehold) {
    return (
      <PageHeader
        description="Primero elige el hogar donde quieres configurar tu perfil."
        eyebrow="Perfil adulto"
        icon={<UserRoundPen size={24} />}
        title="Selecciona un hogar"
        titleId="profile-select-title"
      />
    );
  }

  return (
    <PageHeader
      description="Completa estos pasos para adaptar la experiencia a tus necesidades."
      eyebrow={householdName}
      icon={<UserRoundPen size={24} />}
      title={currentProfile ? 'Edita tu perfil' : 'Configura tu perfil'}
      titleId="profile-title"
    />
  );
}
