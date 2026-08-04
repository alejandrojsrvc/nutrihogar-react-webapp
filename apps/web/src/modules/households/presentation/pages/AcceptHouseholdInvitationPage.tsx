import { UserCheck } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ErrorState } from '../../../../shared/presentation/components/AsyncState';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAcceptHouseholdInvitation } from '../hooks/useHouseholdInvitations';
import '../households.css';

export function AcceptHouseholdInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { acceptInvitation, acceptedInvitation, error, isAccepting } =
    useAcceptHouseholdInvitation();

  async function handleAccept() {
    if (!token) {
      return;
    }

    try {
      await acceptInvitation(token);
    } catch {
      // El error de la mutación se muestra en la pantalla.
    }
  }

  if (!token) {
    return <InvitationError message="El enlace de invitación no es válido." />;
  }

  if (acceptedInvitation) {
    return (
      <section
        className="page-section invitation-acceptance"
        aria-labelledby="invitation-accepted-title"
      >
        <PageHeader
          icon={<UserCheck size={24} />}
          eyebrow="Invitación aceptada"
          title="Ya eres parte de este hogar"
          titleId="invitation-accepted-title"
          description="La invitación se aceptó correctamente. Ahora puedes completar tu perfil para entrar al espacio familiar."
        />
        <Link className="button button--primary" to="/onboarding">
          Continuar configuración
        </Link>
      </section>
    );
  }

  return (
    <section
      className="page-section invitation-acceptance"
      aria-labelledby="accept-invitation-title"
    >
      <PageHeader
        icon={<UserCheck size={24} />}
        eyebrow="Invitación al hogar"
        title="Te invitaron a compartir un hogar"
        titleId="accept-invitation-title"
        description="Acepta la invitación para participar en este espacio familiar con tu cuenta."
      />
      <button
        className="button button--primary"
        disabled={isAccepting}
        onClick={() => void handleAccept()}
        type="button"
      >
        {isAccepting ? 'Aceptando invitación...' : 'Aceptar invitación'}
      </button>
      {error ? (
        <p className="auth-error" role="alert">
          {getAcceptanceErrorMessage(error)}
        </p>
      ) : null}
    </section>
  );
}

function InvitationError({ message }: { message: string }) {
  return (
    <section
      className="page-section invitation-acceptance"
      aria-labelledby="invitation-error-title"
    >
      <PageHeader
        icon={<UserCheck size={24} />}
        eyebrow="Invitación al hogar"
        title="No se pudo abrir la invitación"
        titleId="invitation-error-title"
      />
      <ErrorState
        action={
          <Link className="button button--secondary" to="/app">
            Ir al inicio
          </Link>
        }
        message={message}
      />
    </section>
  );
}

function getAcceptanceErrorMessage(error: unknown): string {
  const status = getErrorStatus(error);

  if (status === 400) {
    return 'El enlace de invitación no es válido.';
  }

  if (status === 401) {
    return 'Tu sesión ya no es válida. Inicia sesión nuevamente.';
  }

  if (status === 403) {
    return 'El correo de tu cuenta no coincide con el de la invitación.';
  }

  if (status === 404) {
    return 'La invitación no existe o el enlace es incorrecto.';
  }

  if (status === 409) {
    return 'La invitación ya fue procesada.';
  }

  if (status === 410) {
    return 'La invitación ha expirado. Solicita una nueva invitación.';
  }

  if (status === 429) {
    return 'Se realizaron demasiados intentos. Espera un momento antes de volver a intentarlo.';
  }

  return error instanceof Error
    ? error.message
    : 'No se pudo aceptar la invitación. Inténtalo nuevamente.';
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const status = error.status;
  return typeof status === 'number' ? status : undefined;
}
