import { Link, Navigate } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAuth } from '../../../auth/presentation/providers/useAuth';
import type { AdultProfile } from '../../application/ports/AdultProfileGateway';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import { useHouseholds } from '../hooks/useHouseholds';

export function AdultProfileOverviewPage() {
  const { currentUser, isCurrentUserLoading } = useAuth();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);

  if (households.isPending || isCurrentUserLoading || profiles.isPending) return <p className="page-section" role="status">Cargando tus datos...</p>;
  if (households.isError || profiles.isError || !currentUser) return <p className="page-section" role="alert">No se pudieron cargar tus datos.</p>;
  if (households.households.length === 0) return <Navigate replace to="/onboarding" />;
  if (!households.activeHousehold) return <section className="page-section" aria-labelledby="profile-household-title"><h1 id="profile-household-title">Selecciona un hogar</h1><p className="lead">Elige el hogar cuyos datos quieres consultar.</p><Link className="button button--primary" to="/app">Ir a mis hogares</Link></section>;

  const profile = profiles.profiles.find((item) => item.userId === currentUser.id);
  if (!profile) return <section className="page-section" aria-labelledby="profile-empty-title"><BackButton fallback="/app" /><PageHeader eyebrow={households.activeHousehold.name} title="Tu perfil" titleId="profile-empty-title" description="Configura tus datos para personalizar las metas y recomendaciones del hogar." /><Link className="button button--primary" to="/app/perfil/editar">Configurar perfil</Link></section>;
  return <ProfileOverview householdName={households.activeHousehold.name} profile={profile} />;
}

function ProfileOverview({ householdName, profile }: { householdName: string; profile: AdultProfile }) {
  return <section className="page-section profile-overview" aria-labelledby="profile-overview-title">
    <BackButton fallback="/app" />
    <PageHeader action={<Link className="button button--primary" to="/app/perfil/editar">Editar perfil</Link>} eyebrow={householdName} title="Tu perfil" titleId="profile-overview-title" description="Consulta tus datos y mantén actualizada la información que usamos para tus recomendaciones." />
    <div className="profile-overview__grid">
      <section className="profile-overview__section" aria-labelledby="profile-personal-title"><h2 id="profile-personal-title">Datos personales</h2><dl><Info label="Nombre" value={profile.name} /><Info label="Edad" value={`${profile.age} años`} /><Info label="Fecha de nacimiento" value={formatDate(profile.birthDate)} /><Info label="Sexo biológico" value={sexLabel(profile.biologicalSex)} /></dl></section>
      <section className="profile-overview__section" aria-labelledby="profile-body-title"><h2 id="profile-body-title">Datos corporales</h2><dl><Info label="Peso actual" value={profile.weightKg == null ? 'Sin registrar' : `${profile.weightKg} kg`} /><Info label="Altura" value={`${profile.heightCm} cm`} /><Info label="Actividad" value={activityLabel(profile.activityLevel)} /><Info label="Objetivo" value={goalLabel(profile.primaryGoal)} /></dl><Link className="button button--secondary" to="/app/perfil/editar">Actualizar mis datos</Link></section>
      <section className="profile-overview__section" aria-labelledby="profile-preferences-title"><h2 id="profile-preferences-title">Preferencias</h2><p>{profile.dietaryRestrictions.length ? `${profile.dietaryRestrictions.length} restricción${profile.dietaryRestrictions.length === 1 ? '' : 'es'} registrada${profile.dietaryRestrictions.length === 1 ? '' : 's'}.` : 'No tienes restricciones registradas.'}</p><p>{profile.hasKitchenScale ? 'Tienes una balanza de cocina.' : 'No tienes una balanza de cocina configurada.'}</p></section>
    </div>
    <section className="profile-overview__goal" aria-labelledby="profile-goal-title"><div><p className="eyebrow">Nutrición</p><h2 id="profile-goal-title">Tu meta nutricional</h2><p className="supporting-text">Consulta las calorías y nutrientes objetivo de tu perfil.</p></div><Link className="button button--secondary" to={`/app/perfiles/${profile.id}/meta`}>Ver meta nutricional</Link></section>
  </section>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`)); }
function sexLabel(value: string) { return value === 'FEMALE' ? 'Femenino' : 'Masculino'; }
function activityLabel(value: string) { return ({ HIGH: 'Alta', LIGHT: 'Ligera', MODERATE: 'Moderada', SEDENTARY: 'Sedentaria', VERY_HIGH: 'Muy alta' } as Record<string, string>)[value] ?? value; }
function goalLabel(value: string) { return ({ FAT_LOSS: 'Perder grasa', MAINTENANCE: 'Mantenerme', MUSCLE_GAIN: 'Ganar masa muscular' } as Record<string, string>)[value] ?? value; }
