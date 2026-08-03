import { CircleUserRound } from 'lucide-react';
import { Link } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import { useHouseholds } from '../hooks/useHouseholds';
import '../households.css';

export function FamilyPage() {
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);

  if (households.isPending || profiles.isPending)
    return (
      <p className="page-section" role="status">
        Cargando familia...
      </p>
    );
  if (households.isError || profiles.isError || !households.activeHousehold)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la familia.
      </p>
    );

  return (
    <section
      className="page-section family-page"
      aria-labelledby="family-title"
    >
      <PageHeader
        action={
          <Link className="button button--primary" to="/app/invitaciones">
            Invitar integrante
          </Link>
        }
        eyebrow={households.activeHousehold.name}
        title="Familia"
        titleId="family-title"
        description="Consulta los integrantes del hogar y abre sus datos cuando lo necesites."
      />
      <div className="profile-list" aria-label="Integrantes de la familia">
        {profiles.profiles.map((profile) => (
          <Link
            className="profile-card"
            key={profile.id}
            to={`/app/perfiles/${profile.id}`}
          >
            <span className="profile-card__identity">
              <CircleUserRound size={20} aria-hidden="true" />
              <strong>{profile.name}</strong>
            </span>
            <span>
              {profile.weightKg == null
                ? 'Datos corporales pendientes'
                : `${profile.weightKg} kg · ${profile.heightCm} cm`}
            </span>
          </Link>
        ))}
      </div>
      {profiles.profiles.length === 0 ? (
        <p className="empty-copy">
          Todavía no hay integrantes registrados en este hogar.
        </p>
      ) : null}
    </section>
  );
}
