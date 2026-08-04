import { MailPlus } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholdInvitations } from '../hooks/useHouseholdInvitations';
import { useHouseholds } from '../hooks/useHouseholds';
import { getErrorStatus } from '../invitationErrorHelpers';
import { openInvitationForm } from '../stores/invitationUiStores';

export function HouseholdInvitationsHeader() {
  const households = useHouseholds();
  const invitations = useHouseholdInvitations(households.activeHousehold?.id);

  if (households.isPending) {
    return (
      <PageHeader
        eyebrow="Invitaciones"
        icon={<MailPlus size={22} />}
        title="Cargando tu hogar..."
        titleId="invitations-title"
      />
    );
  }

  if (households.isError) {
    return (
      <PageHeader
        eyebrow="Invitaciones"
        icon={<MailPlus size={22} />}
        title="No pudimos cargar tu hogar"
        titleId="invitation-error-title"
      />
    );
  }

  if (households.households.length === 0) {
    return null;
  }

  if (!households.activeHousehold) {
    return (
      <PageHeader
        description="Primero elige el hogar donde quieres invitar a un adulto."
        eyebrow="Invitaciones"
        icon={<MailPlus size={22} />}
        title="Selecciona un hogar"
        titleId="invitation-select-title"
      />
    );
  }

  if (invitations.isError) {
    const isPermissionError = getErrorStatus(invitations.error) === 403;

    return (
      <PageHeader
        eyebrow={households.activeHousehold.name}
        icon={<MailPlus size={22} />}
        title={
          isPermissionError
            ? 'No tienes permiso para invitar'
            : 'No pudimos cargar las invitaciones'
        }
        titleId="invitation-error-title"
      />
    );
  }

  return (
    <PageHeader
      action={
        invitations.isPending ? undefined : (
          <button
            className="button button--primary"
            onClick={openInvitationForm}
            type="button"
          >
            Invitar a alguien
          </button>
        )
      }
      description="Invita a otro adulto para organizar juntos la alimentación del hogar."
      eyebrow={households.activeHousehold.name}
      icon={<MailPlus size={22} />}
      title="Invitaciones"
      titleId="invitations-title"
    />
  );
}
