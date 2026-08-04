import { zodResolver } from '@hookform/resolvers/zod';
import { MailPlus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, Navigate } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { BottomSheet } from '../../../../shared/presentation/components/Overlay';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';

import type { HouseholdInvitation } from '../../application/ports/HouseholdInvitationGateway';
import { useHouseholdInvitations } from '../hooks/useHouseholdInvitations';
import { useHouseholds } from '../hooks/useHouseholds';
import '../households.css';
import {
  createHouseholdInvitationFormSchema,
  type CreateHouseholdInvitationFormValues,
} from '../schemas/householdInvitationSchemas';

export function HouseholdInvitationsPage() {
  const [revealedInvitationId, setRevealedInvitationId] = useState<
    string | null
  >(null);
  const [formOpen, setFormOpen] = useState(false);
  const closeInvitationForm = useCallback(() => setFormOpen(false), []);
  const households = useHouseholds();
  const invitations = useHouseholdInvitations(households.activeHousehold?.id);
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
      closeInvitationForm();
    } catch {
      // El error de la mutación se muestra dentro del formulario.
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
      <section
        className="page-section"
        aria-labelledby="invitation-select-title"
      >
        <PageHeader
          icon={<MailPlus size={24} />}
          eyebrow="Invitaciones"
          title="Selecciona un hogar"
          titleId="invitation-select-title"
          description="Primero elige el hogar donde quieres invitar a un adulto."
        />
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
    const isPermissionError = getErrorStatus(invitations.error) === 403;

    return (
      <section
        className="page-section"
        aria-labelledby="invitation-error-title"
      >
        <PageHeader
          icon={<MailPlus size={24} />}
          eyebrow={households.activeHousehold.name}
          title={
            isPermissionError
              ? 'No tienes permiso para invitar'
              : 'No pudimos cargar las invitaciones'
          }
          titleId="invitation-error-title"
        />
        <ErrorState
          action={
            isPermissionError ? (
              <Link className="button button--secondary" to="/app/familia">
                Volver a Familia
              </Link>
            ) : (
              <button
                className="button button--secondary"
                onClick={() => void invitations.refetch()}
                type="button"
              >
                Reintentar
              </button>
            )
          }
          message={getInvitationErrorMessage(
            invitations.error,
            'No se pudieron cargar las invitaciones del hogar.',
          )}
        />
      </section>
    );
  }

  const pendingInvitations = invitations.invitations.filter(
    (invitation) => invitation.status === 'PENDING',
  );

  return (
    <section
      className="page-section invitations-page"
      aria-labelledby="invitations-title"
    >
      <BackButton fallback="/app/familia" />
      <PageHeader
        action={
          <button
            className="button button--primary"
            onClick={() => setFormOpen(true)}
            type="button"
          >
            Invitar a alguien
          </button>
        }
        icon={<MailPlus size={24} />}
        eyebrow={households.activeHousehold.name}
        title="Invitaciones"
        titleId="invitations-title"
        description="Invita a otro adulto para organizar juntos la alimentación del hogar."
      />

      <BottomSheet
        onClose={closeInvitationForm}
        open={formOpen}
        title="Invitar a alguien"
      >
        <form
          className="auth-form invitation-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <fieldset className="invitation-form__fields">
            <legend className="visually-hidden">Datos de la invitación</legend>
            <div className="form-field">
              <label htmlFor="invitation-email">Correo electrónico</label>
              <input
                autoComplete="email"
                id="invitation-email"
                type="email"
                {...register('email')}
                aria-describedby={
                  errors.email ? 'invitation-email-error' : undefined
                }
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email ? (
                <p
                  className="form-field__error"
                  id="invitation-email-error"
                >
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="form-field">
              <label htmlFor="invitation-role">Rol en el hogar</label>
              <select
                id="invitation-role"
                {...register('role')}
                aria-describedby={
                  errors.role ? 'invitation-role-error' : undefined
                }
                aria-invalid={errors.role ? 'true' : 'false'}
              >
                <option value="MEMBER">Integrante</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {errors.role ? (
                <p
                  className="form-field__error"
                  id="invitation-role-error"
                >
                  {errors.role.message}
                </p>
              ) : null}
            </div>
          </fieldset>
          {invitations.createInvitationError ? (
            <p className="auth-error" role="alert">
              {getInvitationErrorMessage(
                invitations.createInvitationError,
                'No se pudo crear la invitación. Inténtalo nuevamente.',
              )}
            </p>
          ) : null}
          <div className="invitation-form__actions">
            <button
              className="button button--secondary"
              onClick={closeInvitationForm}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="button button--primary"
              disabled={invitations.isCreatingInvitation}
              type="submit"
            >
              {invitations.isCreatingInvitation
                ? 'Creando invitación...'
                : 'Crear invitación'}
            </button>
          </div>
        </form>
      </BottomSheet>

      {invitations.createdInvitation ? (
        <CreatedInvitation invitation={invitations.createdInvitation} />
      ) : null}

      <div className="invitation-section" aria-labelledby="pending-title">
        <h2 id="pending-title">Invitaciones pendientes</h2>
        {pendingInvitations.length === 0 ? (
          <EmptyState
            description="Las invitaciones que envíes aparecerán aquí hasta que sean aceptadas o expiren."
            title="No hay invitaciones pendientes"
          />
        ) : (
          <div className="invitation-list">
            {pendingInvitations.map((invitation) => (
              <article className="invitation-row" key={invitation.id}>
                <div className="invitation-row__content">
                  <strong>{invitation.email}</strong>
                  <span>
                    {getRoleLabel(invitation.role)} · vence el{' '}
                    {formatInvitationDate(invitation.expiresAt)}
                  </span>
                </div>
                <div className="invitation-row__actions">
                  <small className="invitation-status">Pendiente</small>
                  {invitation.token ? (
                    <button
                      className="button button--secondary"
                      aria-expanded={revealedInvitationId === invitation.id}
                      onClick={() =>
                        setRevealedInvitationId((currentId) =>
                          currentId === invitation.id ? null : invitation.id,
                        )
                      }
                      type="button"
                    >
                      {revealedInvitationId === invitation.id
                        ? 'Ocultar enlace'
                        : 'Recuperar enlace'}
                    </button>
                  ) : null}
                </div>
                {revealedInvitationId === invitation.id && invitation.token ? (
                  <InvitationLink invitation={invitation} />
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
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
        La invitación fue creada. Comparte el acceso configurado para el
        invitado.
      </p>
    );
  }

  return (
    <div className="invitation-success" role="status">
      <h2>Invitación lista</h2>
      <InvitationLink invitation={invitation} />
    </div>
  );
}

function InvitationLink({ invitation }: { invitation: HouseholdInvitation }) {
  if (!invitation.token) {
    return null;
  }

  const invitationUrl = getInvitationUrl(invitation.token);

  return (
    <div className="invitation-link-wrapper">
      <p>Comparte este enlace con {invitation.email}:</p>
      <input
        aria-label={`Enlace de invitación para ${invitation.email}`}
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
    <section className="page-section">
      {isError ? (
        <ErrorState message={message} />
      ) : (
        <LoadingState message={message} />
      )}
    </section>
  );
}

function getRoleLabel(role: 'ADMIN' | 'MEMBER'): string {
  return role === 'ADMIN' ? 'Administrador' : 'Integrante';
}

function getInvitationUrl(token: string): string {
  return `${window.location.origin}/invitaciones/${encodeURIComponent(token)}`;
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
    return 'Tu sesión ya no es válida. Inicia sesión nuevamente.';
  }

  if (status === 403) {
    return 'Solo los administradores del hogar pueden gestionar invitaciones.';
  }

  if (status === 400 || status === 422) {
    return 'Revisa el correo y el rol antes de crear la invitación.';
  }

  if (status === 409) {
    return 'Ese correo ya pertenece al hogar o ya tiene una invitación pendiente.';
  }

  if (status === 429) {
    return 'Se alcanzó el límite de intentos. Espera un momento antes de volver a invitar.';
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
