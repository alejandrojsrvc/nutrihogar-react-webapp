import { Link, useParams } from 'react-router';

import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useNutritionGoalSuggestion } from '../hooks/useNutritionGoals';
import { NutritionGoalValuesForm } from '../components/NutritionGoalValuesForm';

export function NutritionGoalProposalPage() {
  const { profileId } = useParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const suggestion = useNutritionGoalSuggestion(profileId);

  if (suggestion.isPending || profiles.isPending) {
    return <p className="page-section" role="status">Cargando la propuesta...</p>;
  }

  if (!suggestion.data || !profileId) {
    return (
      <section className="page-section" aria-labelledby="proposal-missing-title">
        <h1 id="proposal-missing-title">La propuesta ya no está disponible</h1>
        <Link className="button button--secondary" to={`/app/perfiles/${profileId ?? ''}/meta`}>Volver a la meta</Link>
      </section>
    );
  }

  return (
    <section className="page-section" aria-labelledby="proposal-title">
      <p className="eyebrow">Propuesta nutricional</p>
      <h1 id="proposal-title">Revisa tu estimación</h1>
      <NutritionGoalValuesForm
        profileId={profileId}
        suggestion={suggestion.data}
        values={suggestion.data.suggestion}
      />
    </section>
  );
}
