import { Link, Navigate, useParams } from 'react-router';

import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { ThemeControl } from '../../../../shared/presentation/components/ThemeControl';
import { useAuth } from '../../../auth/presentation/providers/useAuth';
import type { AdultProfile } from '../../application/ports/AdultProfileGateway';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import { useHouseholds } from '../hooks/useHouseholds';
import '../households.css';

export function AdultProfileOverviewPage() {
  const { currentUser, isCurrentUserLoading } = useAuth();
  const { profileId } = useParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);

  if (
    households.isPending ||
    isCurrentUserLoading ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return (
      <section className="page-section">
        <LoadingState message="Cargando los datos del perfil..." />
      </section>
    );
  }
  if (
    households.isError ||
    (Boolean(households.activeHousehold) && profiles.isError) ||
    !currentUser
  ) {
    return (
      <section className="page-section">
        <ErrorState message="No pudimos cargar los datos de este perfil." />
      </section>
    );
  }
  if (households.households.length === 0)
    return <Navigate replace to="/onboarding" />;
  if (!households.activeHousehold)
    return (
      <section
        className="page-section"
        aria-labelledby="profile-household-title"
      >
        <p className="lead">Elige el hogar cuyos datos quieres consultar.</p>
        <Link className="button button--primary" to="/app">
          Ir a mis hogares
        </Link>
      </section>
    );

  const profile = profiles.profiles.find((item) =>
    profileId ? item.id === profileId : item.userId === currentUser.id,
  );
  if (!profile && profileId) {
    return (
      <section className="page-section">
        <BackButton fallback="/app/familia" />
        <ErrorState
          action={
            <Link className="button button--secondary" to="/app/familia">
              Volver a Familia
            </Link>
          }
          message="No encontramos el perfil solicitado."
        />
      </section>
    );
  }
  if (!profile)
    return (
      <section className="page-section" aria-labelledby="profile-empty-title">
        <BackButton fallback="/app" />
        <Link className="button button--primary" to="/app/perfil/editar">
          Configurar perfil
        </Link>
      </section>
    );
  return (
    <ProfileOverview
      isOwnProfile={profile.userId === currentUser.id}
      profile={profile}
      showBack={Boolean(profileId)}
    />
  );
}

function ProfileOverview({
  isOwnProfile,
  profile,
  showBack,
}: {
  isOwnProfile: boolean;
  profile: AdultProfile;
  showBack: boolean;
}) {
  return (
    <section
      className="page-section profile-overview"
      aria-labelledby="profile-overview-title"
    >
      {showBack ? <BackButton fallback="/app/familia" /> : null}
      <div className="profile-overview__grid">
        <section
          className="profile-overview__section"
          aria-labelledby="profile-personal-title"
        >
          <h2 id="profile-personal-title">Datos personales</h2>
          <dl>
            <Info label="Nombre" value={profile.name} />
            <Info label="Edad" value={`${profile.age} años`} />
            <Info
              label="Fecha de nacimiento"
              value={formatDate(profile.birthDate)}
            />
            <Info
              label="Sexo biológico"
              value={sexLabel(profile.biologicalSex)}
            />
          </dl>
        </section>
        <section
          className="profile-overview__section"
          aria-labelledby="profile-body-title"
        >
          <h2 id="profile-body-title">Datos corporales</h2>
          <dl>
            <Info
              label="Peso actual"
              value={
                profile.weightKg == null
                  ? 'Sin registrar'
                  : `${profile.weightKg} kg`
              }
            />
            <Info label="Altura" value={`${profile.heightCm} cm`} />
            <Info
              label="Actividad"
              value={activityLabel(profile.activityLevel)}
            />
            <Info label="Objetivo" value={goalLabel(profile.primaryGoal)} />
          </dl>
          {isOwnProfile ? (
            <Link className="button button--secondary" to="/app/perfil/editar">
              Actualizar mis datos
            </Link>
          ) : null}
        </section>
        <section
          className="profile-overview__section"
          aria-labelledby="profile-preferences-title"
        >
          <h2 id="profile-preferences-title">Preferencias</h2>
          <p>
            {profile.dietaryRestrictions.length
              ? `${profile.dietaryRestrictions.length} restricción${profile.dietaryRestrictions.length === 1 ? '' : 'es'} registrada${profile.dietaryRestrictions.length === 1 ? '' : 's'}.`
              : `${isOwnProfile ? 'No tienes' : 'No tiene'} restricciones registradas.`}
          </p>
          <p>
            {profile.hasKitchenScale
              ? `${isOwnProfile ? 'Tienes' : 'Tiene'} una balanza de cocina.`
              : `${isOwnProfile ? 'No tienes' : 'No tiene'} una balanza de cocina configurada.`}
          </p>
          {isOwnProfile ? <ThemeControl /> : null}
        </section>
      </div>
      <section
        className="profile-overview__goal"
        aria-labelledby="profile-goal-title"
      >
        <div>
          <p className="eyebrow">Nutrición</p>
          <h2 id="profile-goal-title">
            {isOwnProfile ? 'Tu meta nutricional' : 'Meta nutricional'}
          </h2>
          <p className="supporting-text">
            Consulta las calorías y nutrientes objetivo de{' '}
            {isOwnProfile ? 'tu perfil' : 'este perfil'}.
          </p>
        </div>
        <Link
          className="button button--secondary"
          to={`/app/perfiles/${profile.id}/meta`}
        >
          Ver meta nutricional
        </Link>
      </section>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(
    new Date(`${value}T12:00:00`),
  );
}
function sexLabel(value: string) {
  return value === 'FEMALE' ? 'Femenino' : 'Masculino';
}
function activityLabel(value: string) {
  return (
    (
      {
        HIGH: 'Alta',
        LIGHT: 'Ligera',
        MODERATE: 'Moderada',
        SEDENTARY: 'Sedentaria',
        VERY_HIGH: 'Muy alta',
      } as Record<string, string>
    )[value] ?? value
  );
}
function goalLabel(value: string) {
  return (
    (
      {
        FAT_LOSS: 'Perder grasa',
        MAINTENANCE: 'Mantenerme',
        MUSCLE_GAIN: 'Ganar masa muscular',
      } as Record<string, string>
    )[value] ?? value
  );
}
