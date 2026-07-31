import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  useCurrentNutritionGoal,
  useGenerateNutritionGoalSuggestion,
} from '../hooks/useNutritionGoals';
import { NutritionGoalValuesForm } from '../components/NutritionGoalValuesForm';

export function NutritionGoalPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const profile = profiles.profiles.find((item) => item.id === profileId);
  const currentGoal = useCurrentNutritionGoal(profileId);
  const generate = useGenerateNutritionGoalSuggestion();

  if (!profileId || profiles.isPending || currentGoal.isPending) {
    return <p className="page-section" role="status">Cargando tu meta nutricional...</p>;
  }

  if (!profile) {
    return (
      <section className="page-section" aria-labelledby="goal-profile-error">
        <h1 id="goal-profile-error">No encontramos este perfil</h1>
        <Link className="button button--secondary" to="/app">Volver al inicio</Link>
      </section>
    );
  }

  if (currentGoal.isError) {
    return <p className="page-section" role="alert">No se pudo cargar la meta nutricional.</p>;
  }

  if (currentGoal.data) {
    return (
      <section className="page-section" aria-labelledby="current-goal-title">
        <BackButton fallback="/app" />
        <PageHeader eyebrow="Meta nutricional" title={`Meta activa de ${profile.name}`} titleId="current-goal-title" />
        <NutritionGoalValuesForm values={currentGoal.data} readOnly />
        <button className="button button--primary" onClick={() => generate.mutate(profileId, { onSuccess: () => navigate(`/app/perfiles/${profileId}/meta/propuesta`) })} type="button">
          Generar una nueva propuesta
        </button>
        {generate.isError ? <p role="alert">No se pudo generar una nueva propuesta.</p> : null}
      </section>
    );
  }

  return <GenerateGoal profileId={profileId} profileName={profile.name} />;
}

function GenerateGoal({ profileId, profileName }: { profileId: string; profileName: string }) {
  const navigate = useNavigate();
  const generate = useGenerateNutritionGoalSuggestion();
  const [hasRequested, setHasRequested] = useState(false);

  return (
    <section className="page-section" aria-labelledby="goal-start-title">
      <BackButton fallback="/app" />
      <PageHeader eyebrow="Meta nutricional" title={`Configura la meta de ${profileName}`} titleId="goal-start-title" description="Usaremos los datos de tu perfil para preparar una estimación que podrás revisar antes de confirmarla." />
      <button
        className="button button--primary"
        disabled={generate.isPending}
        onClick={() => {
          setHasRequested(true);
          generate.mutate(profileId, { onSuccess: () => navigate(`/app/perfiles/${profileId}/meta/propuesta`) });
        }}
        type="button"
      >
        {generate.isPending ? 'Calculando...' : 'Generar propuesta'}
      </button>
      {hasRequested && generate.isError ? <p role="alert">El perfil está incompleto o no pudimos generar la propuesta.</p> : null}
    </section>
  );
}
