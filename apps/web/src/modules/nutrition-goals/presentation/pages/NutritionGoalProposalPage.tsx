import { Link, useParams } from 'react-router';
import { Target } from 'lucide-react';

import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useNutritionGoalSuggestion } from '../hooks/useNutritionGoals';
import { NutritionGoalValuesForm } from '../components/NutritionGoalValuesForm';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import '../nutrition-goals.css';

export function NutritionGoalProposalPage() {
  const { profileId } = useParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const suggestion = useNutritionGoalSuggestion(profileId);
  const profile = profiles.profiles.find((item) => item.id === profileId);

  if (
    suggestion.isPending ||
    households.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return (
      <p className="page-section" role="status">
        Cargando la propuesta...
      </p>
    );
  }

  if (
    households.isError ||
    !households.activeHousehold ||
    profiles.isError
  ) {
    return (
      <section className="page-section nutrition-goal-state" role="alert">
        <h1>No pudimos cargar el perfil</h1>
        <p>La propuesta no se confirmó.</p>
        <Link className="button button--secondary" to="/app">
          Volver al inicio
        </Link>
      </section>
    );
  }

  if (!suggestion.data || !profileId) {
    return (
      <section
        className="page-section"
        aria-labelledby="proposal-missing-title"
      >
        <h1 id="proposal-missing-title">La propuesta ya no está disponible</h1>
        <Link
          className="button button--secondary"
          to={`/app/perfiles/${profileId ?? ''}/meta`}
        >
          Volver a la meta
        </Link>
      </section>
    );
  }

  if (!profile) {
    return (
      <section
        className="page-section nutrition-goal-state"
        aria-labelledby="proposal-profile-missing-title"
      >
        <h1 id="proposal-profile-missing-title">
          No encontramos este perfil
        </h1>
        <p>La propuesta no se confirmó.</p>
        <Link className="button button--secondary" to="/app">
          Volver al inicio
        </Link>
      </section>
    );
  }

  return (
    <section
      className="page-section nutrition-goal-page"
      aria-labelledby="proposal-title"
    >
      <BackButton fallback={`/app/perfiles/${profileId}/meta`} />
      <PageHeader
        description={`Revisa la estimación para ${profile.name} antes de guardarla.`}
        icon={<Target size={25} />}
        title="Revisa tu estimación"
        titleId="proposal-title"
      />
      <NutritionGoalValuesForm
        profileId={profileId}
        suggestion={suggestion.data}
        values={suggestion.data.suggestion}
      />
    </section>
  );
}
