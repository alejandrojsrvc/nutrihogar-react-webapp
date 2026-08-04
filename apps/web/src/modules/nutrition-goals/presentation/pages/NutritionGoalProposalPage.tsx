import { Link, useParams } from 'react-router';

import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useNutritionGoalSuggestion } from '../hooks/useNutritionGoals';
import { NutritionGoalValuesForm } from '../components/NutritionGoalValuesForm';
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

  if (households.isError || !households.activeHousehold || profiles.isError) {
    return (
      <section
        className="page-section nutrition-goal-state"
        aria-labelledby="goal-proposal-profiles-error-title"
        role="alert"
      >
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
        aria-labelledby="goal-proposal-missing-title"
      >
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
        aria-labelledby="goal-proposal-profile-missing-title"
      >
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
      aria-labelledby="goal-proposal-title"
    >
      <BackButton fallback={`/app/perfiles/${profileId}/meta`} />
      <NutritionGoalValuesForm
        profileId={profileId}
        suggestion={suggestion.data}
        values={suggestion.data.suggestion}
      />
    </section>
  );
}
