import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import { ErrorState } from '../../../../shared/presentation/components/AsyncState';
import { useAcceptHouseholdInvitation } from '../hooks/useHouseholdInvitations';
import { getAcceptanceErrorMessage } from '../invitationErrorHelpers';
import '../households.css';
import {
  resetInvitationAcceptance,
  useAcceptedInvitation,
} from '../stores/invitationUiStores';

export function AcceptHouseholdInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { acceptInvitation, error, isAccepting } =
    useAcceptHouseholdInvitation();
  const acceptedInvitation = useAcceptedInvitation();

  useEffect(() => {
    resetInvitationAcceptance();
  }, [token]);

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
