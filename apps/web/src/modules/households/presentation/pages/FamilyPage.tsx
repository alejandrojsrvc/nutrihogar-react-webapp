import { ChevronRight } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import { useHouseholds } from '../hooks/useHouseholds';
import '../households.css';

export function FamilyPage() {
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);

  if (
    households.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return (
      <section className="page-section">
        <LoadingState message="Cargando la familia..." />
      </section>
    );
  }

  if (households.isError || profiles.isError) {
    return (
      <section className="page-section">
        <ErrorState
          action={
            <button
              className="button button--secondary"
              onClick={() =>
                void (households.isError
                  ? households.refetch()
                  : profiles.refetch())
              }
              type="button"
            >
              Reintentar
            </button>
          }
          message="No pudimos cargar los integrantes de este hogar."
        />
      </section>
    );
  }

  if (households.households.length === 0) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!households.activeHousehold) {
    return (
      <section className="page-section">
        <ErrorState
          action={
            <Link className="button button--secondary" to="/app">
              Seleccionar hogar
            </Link>
          }
          message="Selecciona un hogar para consultar su familia."
        />
      </section>
    );
  }

  return (
    <section
      className="page-section family-page"
      aria-labelledby="family-title"
    >
      <div className="module-toolbar">
        <Link className="button button--primary" to="/app/invitaciones">
          Invitar integrante
        </Link>
      </div>
      {profiles.profiles.length === 0 ? (
        <EmptyState
          description="Cuando un adulto complete su perfil, aparecerá en esta lista."
          title="Todavía no hay integrantes"
        />
      ) : (
        <div className="profile-list" aria-label="Integrantes de la familia">
          {profiles.profiles.map((profile) => (
            <Link
              className="profile-row"
              key={profile.id}
              to={`/app/perfiles/${profile.id}`}
            >
              <span className="profile-row__avatar" aria-hidden="true">
                {getInitial(profile.name)}
              </span>
              <span className="profile-row__content">
                <strong>{profile.name}</strong>
                <span>
                  {profile.weightKg == null
                    ? 'Datos corporales pendientes'
                    : `${profile.weightKg} kg · ${profile.heightCm} cm`}
                </span>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase('es');
}
