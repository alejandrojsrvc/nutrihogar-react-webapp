import { Link, useParams } from 'react-router';

import { useAcceptHouseholdInvitation } from '../hooks/useHouseholdInvitations';

export function AcceptHouseholdInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const {
    acceptInvitation,
    acceptedInvitation,
    error,
    isAccepting,
  } = useAcceptHouseholdInvitation();

  async function handleAccept() {
    if (!token) {
      return;
    }

    try {
      await acceptInvitation(token);
    } catch {
      // El error de la mutacion se muestra en la pantalla.
    }
  }

  if (!token) {
    return <InvitationError message="El enlace de invitacion no es valido." />;
  }

  if (acceptedInvitation) {
    return (
      <section className="page-section" aria-labelledby="invitation-accepted-title">
        <p className="eyebrow">Invitacion aceptada</p>
        <h1 id="invitation-accepted-title">Ya eres parte de este hogar</h1>
        <p className="lead">
          La invitacion se acepto correctamente. Ahora puedes entrar al
          espacio familiar.
        </p>
        <Link className="button button--primary" to="/onboarding">
          Continuar configuracion
        </Link>
      </section>
    );
  }

  return (
    <section className="page-section" aria-labelledby="accept-invitation-title">
      <p className="eyebrow">Invitacion al hogar</p>
      <h1 id="accept-invitation-title">Te invitaron a compartir un hogar</h1>
      <p className="lead">
        Acepta la invitacion para consultar el espacio familiar con tu cuenta.
      </p>
      <button
        className="button button--primary"
        disabled={isAccepting}
        onClick={() => void handleAccept()}
        type="button"
      >
        {isAccepting ? 'Aceptando invitacion...' : 'Aceptar invitacion'}
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
    <section className="page-section" aria-labelledby="invitation-error-title">
      <p className="eyebrow">Invitacion al hogar</p>
      <h1 id="invitation-error-title">No se pudo abrir la invitacion</h1>
      <p className="lead" role="alert">
        {message}
      </p>
      <Link className="button button--secondary" to="/app">
        Ir al inicio
      </Link>
    </section>
  );
}

function getAcceptanceErrorMessage(error: unknown): string {
  const status = getErrorStatus(error);

  if (status === 401) {
    return 'Tu sesion ya no es valida. Inicia sesion nuevamente.';
  }

  if (status === 403) {
    return 'El correo de tu cuenta no coincide con el de la invitacion.';
  }

  if (status === 404) {
    return 'La invitacion no existe o el enlace es incorrecto.';
  }

  if (status === 409) {
    return 'La invitacion ya fue procesada.';
  }

  if (status === 410) {
    return 'La invitacion ha expirado. Solicita una nueva invitacion.';
  }

  return error instanceof Error
    ? error.message
    : 'No se pudo aceptar la invitacion. Intentalo nuevamente.';
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const status = error.status;
  return typeof status === 'number' ? status : undefined;
}
