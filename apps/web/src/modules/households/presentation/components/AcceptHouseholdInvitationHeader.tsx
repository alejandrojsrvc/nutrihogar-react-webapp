import { UserCheck } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useAcceptedInvitation } from '../stores/invitationUiStores';

export function AcceptHouseholdInvitationHeader() {
  const { token } = useRouteParams();
  const acceptedInvitation = useAcceptedInvitation();

  if (!token) {
    return (
      <PageHeader
        eyebrow="Invitación al hogar"
        icon={<UserCheck size={22} />}
        title="No se pudo abrir la invitación"
        titleId="invitation-error-title"
      />
    );
  }

  if (acceptedInvitation) {
    return (
      <PageHeader
        description="La invitación se aceptó correctamente. Ahora puedes completar tu perfil para entrar al espacio familiar."
        eyebrow="Invitación aceptada"
        icon={<UserCheck size={22} />}
        title="Ya eres parte de este hogar"
        titleId="invitation-accepted-title"
      />
    );
  }

  return (
    <PageHeader
      description="Acepta la invitación para participar en este espacio familiar con tu cuenta."
      eyebrow="Invitación al hogar"
      icon={<UserCheck size={22} />}
      title="Te invitaron a compartir un hogar"
      titleId="accept-invitation-title"
    />
  );
}
