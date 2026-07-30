import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, Navigate } from 'react-router';

import type { HouseholdInvitation } from '../../application/ports/HouseholdInvitationGateway';
import { useHouseholdInvitations } from '../hooks/useHouseholdInvitations';
import { useHouseholds } from '../hooks/useHouseholds';
import {
  createHouseholdInvitationFormSchema,
  type CreateHouseholdInvitationFormValues,
} from '../schemas/householdInvitationSchemas';

export function HouseholdInvitationsPage() {
  const households = useHouseholds();
  const invitations = useHouseholdInvitations(
    households.activeHousehold?.id,
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateHouseholdInvitationFormValues>({
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
    resolver: zodResolver(createHouseholdInvitationFormSchema),
  });

  const onSubmit: SubmitHandler<CreateHouseholdInvitationFormValues> = async (
    values,
  ) => {
    try {
      await invitations.createInvitation({
        email: values.email.trim(),
        role: values.role,
      });
      reset({ email: '', role: 'MEMBER' });
    } catch {
      // El error de la mutacion se muestra debajo del formulario.
    }
  };

  if (households.isPending) {
    return <InvitationStatus message="Cargando tu hogar..." />;
  }

  if (households.isError) {
    return (
      <InvitationStatus
        isError
        message="No se pudo cargar el hogar para gestionar invitaciones."
      />
    );
  }

  if (households.households.length === 0) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!households.activeHousehold) {
    return (
      <section className="page-section" aria-labelledby="invitation-select-title">
        <p className="eyebrow">Invitaciones</p>
        <h1 id="invitation-select-title">Selecciona un hogar</h1>
        <p className="lead">
          Primero elige el hogar donde quieres invitar a un adulto.
        </p>
        <Link className="button button--primary" to="/app">
          Ir a mis hogares
        </Link>
      </section>
    );
  }

  if (invitations.isPending) {
    return <InvitationStatus message="Cargando invitaciones..." />;
  }

  if (invitations.isError) {
    return (
      <section className="page-section" aria-labelledby="invitation-error-title">
        <p className="eyebrow">Invitaciones</p>
        <h1 id="invitation-error-title">No puedes gestionar invitaciones</h1>
        <p className="lead" role="alert">
          {getInvitationErrorMessage(
            invitations.error,
            'No se pudieron cargar las invitaciones del hogar.',
          )}
        </p>
        <Link className="button button--secondary" to="/app">
          Volver al inicio
        </Link>
      </section>
    );
  }

  const pendingInvitations = invitations.invitations.filter(
    (invitation) => invitation.status === 'PENDING',
  );

  return (
    <section className="page-section" aria-labelledby="invitations-title">
      <p className="eyebrow">{households.activeHousehold.name}</p>
      <h1 id="invitations-title">Invita a tu familia</h1>
      <p className="lead">
        Comparte el hogar con otro adulto para que pueda participar en su
        organizacion.
      </p>

      <div className="invitation-section">
        <h2>Enviar invitacion</h2>
        <form
          className="auth-form invitation-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="invitation-email">Correo electronico</label>
            <input
              autoComplete="email"
              id="invitation-email"
              type="email"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email ? (
              <p className="form-field__error">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="form-field">
            <label htmlFor="invitation-role">Rol en el hogar</label>
            <select
              id="invitation-role"
              {...register('role')}
              aria-invalid={errors.role ? 'true' : 'false'}
            >
              <option value="MEMBER">Integrante</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.role ? (
              <p className="form-field__error">{errors.role.message}</p>
            ) : null}
          </div>
          <button
            className="button button--primary auth-form__submit"
            disabled={invitations.isCreatingInvitation}
            type="submit"
          >
            {invitations.isCreatingInvitation
              ? 'Creando invitacion...'
              : 'Crear invitacion'}
          </button>
        </form>
        {invitations.createInvitationError ? (
          <p className="auth-error" role="alert">
            {getInvitationErrorMessage(
              invitations.createInvitationError,
              'No se pudo crear la invitacion. Intentalo nuevamente.',
            )}
          </p>
        ) : null}
        {invitations.createdInvitation ? (
          <CreatedInvitation invitation={invitations.createdInvitation} />
        ) : null}
      </div>

      <div className="invitation-section" aria-labelledby="pending-title">
        <h2 id="pending-title">Invitaciones pendientes</h2>
        {pendingInvitations.length === 0 ? (
          <p className="empty-copy">No hay invitaciones pendientes.</p>
        ) : (
          <div className="invitation-list">
            {pendingInvitations.map((invitation) => (
              <article className="invitation-card" key={invitation.id}>
                <div>
                  <strong>{invitation.email}</strong>
                  <span>
                    {getRoleLabel(invitation.role)} · vence el{' '}
                    {formatInvitationDate(invitation.expiresAt)}
                  </span>
                </div>
                <small>Pendiente</small>
              </article>
            ))}
          </div>
        )}
      </div>

      <Link className="button button--secondary" to="/app">
        Volver al inicio
      </Link>
    </section>
  );
}

function CreatedInvitation({
  invitation,
}: {
  invitation: HouseholdInvitation;
}) {
  if (!invitation.token) {
    return (
      <p className="invitation-success" role="status">
        La invitacion fue creada. Comparte el acceso configurado para el
        invitado.
      </p>
    );
  }

  const invitationUrl = `${window.location.origin}/invitaciones/${encodeURIComponent(
    invitation.token,
  )}`;

  return (
    <div className="invitation-success" role="status">
      <h3>Invitacion lista</h3>
      <p>Comparte este enlace con {invitation.email}:</p>
      <input
        aria-label="Enlace de invitacion"
        className="invitation-link"
        readOnly
        value={invitationUrl}
        onFocus={(event) => event.currentTarget.select()}
      />
    </div>
  );
}

function InvitationStatus({
  isError = false,
  message,
}: {
  isError?: boolean;
  message: string;
}) {
  return (
    <section className="page-section" aria-labelledby="invitation-status-title">
      <p className="eyebrow">Invitaciones</p>
      <h1 id="invitation-status-title">Invitaciones del hogar</h1>
      <p className="lead" role={isError ? 'alert' : 'status'}>
        {message}
      </p>
    </section>
  );
}

function getRoleLabel(role: 'ADMIN' | 'MEMBER'): string {
  return role === 'ADMIN' ? 'Administrador' : 'Integrante';
}

function formatInvitationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getInvitationErrorMessage(error: unknown, fallback: string): string {
  const status = getErrorStatus(error);

  if (status === 401) {
    return 'Tu sesion ya no es valida. Inicia sesion nuevamente.';
  }

  if (status === 403) {
    return 'Solo los administradores del hogar pueden gestionar invitaciones.';
  }

  if (status === 409) {
    return 'Ese correo ya pertenece al hogar o ya tiene una invitacion pendiente.';
  }

  return error instanceof Error ? error.message : fallback;
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const status = error.status;
  return typeof status === 'number' ? status : undefined;
}
