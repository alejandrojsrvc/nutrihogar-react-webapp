import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Sparkles } from 'lucide-react';

import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  useCurrentNutritionGoal,
  useGenerateNutritionGoalSuggestion,
} from '../hooks/useNutritionGoals';
import { NutritionGoalValuesForm } from '../components/NutritionGoalValuesForm';
import '../nutrition-goals.css';

export function NutritionGoalPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const profile = profiles.profiles.find((item) => item.id === profileId);
  const currentGoal = useCurrentNutritionGoal(profileId);
  const generate = useGenerateNutritionGoalSuggestion();

  if (
    !profileId ||
    households.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending) ||
    (Boolean(households.activeHousehold) && currentGoal.isPending)
  ) {
    return (
      <p className="page-section" role="status">
        Cargando tu meta nutricional...
      </p>
    );
  }

  if (households.isError || !households.activeHousehold || profiles.isError) {
    return (
      <section
        className="page-section nutrition-goal-state"
        aria-labelledby="goal-profiles-error-title"
        role="alert"
      >
        <p>La meta se conserva sin cambios.</p>
        <button
          className="button button--secondary"
          onClick={() => {
            void households.refetch();
            void profiles.refetch();
          }}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="page-section" aria-labelledby="goal-profile-error">
        <Link className="button button--secondary" to="/app">
          Volver al inicio
        </Link>
      </section>
    );
  }

  if (currentGoal.isError) {
    return (
      <section
        className="page-section nutrition-goal-state"
        aria-labelledby="goal-error-title"
        role="alert"
      >
        <p>El perfil seleccionado sigue siendo {profile.name}.</p>
        <button
          className="button button--secondary"
          onClick={() => void currentGoal.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (currentGoal.data) {
    return (
      <section
        className="page-section nutrition-goal-page"
        aria-labelledby="current-goal-title"
      >
        <BackButton fallback="/app" />
        <p className="nutrition-goal-validity">
          Vigente desde {formatDate(currentGoal.data.validFrom)}
          {currentGoal.data.validUntil
            ? ` hasta ${formatDate(currentGoal.data.validUntil)}`
            : ''}
        </p>
        <NutritionGoalValuesForm values={currentGoal.data} readOnly />
        {generate.isError ? (
          <p className="nutrition-goal-error" role="alert">
            No se pudo generar una nueva propuesta. La meta actual sigue
            vigente.
          </p>
        ) : null}
        <div className="nutrition-goal-actions">
          <button
            className="button button--primary"
            disabled={generate.isPending}
            onClick={() =>
              generate.mutate(profileId, {
                onSuccess: () =>
                  navigate(`/app/perfiles/${profileId}/meta/propuesta`),
              })
            }
            type="button"
          >
            {!generate.isPending ? (
              <Sparkles aria-hidden="true" size={18} />
            ) : null}
            {generate.isPending
              ? 'Generando propuesta...'
              : 'Generar nueva propuesta'}
          </button>
        </div>
      </section>
    );
  }

  return <GenerateGoal profileId={profileId} />;
}

function GenerateGoal({ profileId }: { profileId: string }) {
  const navigate = useNavigate();
  const generate = useGenerateNutritionGoalSuggestion();
  const [hasRequested, setHasRequested] = useState(false);

  return (
    <section
      className="page-section nutrition-goal-page"
      aria-labelledby="goal-start-title"
    >
      <BackButton fallback="/app" />
      {hasRequested && generate.isError ? (
        <p className="nutrition-goal-error" role="alert">
          El perfil está incompleto o no pudimos generar la propuesta.
        </p>
      ) : null}
      <div className="nutrition-goal-actions">
        <button
          className="button button--primary"
          disabled={generate.isPending}
          onClick={() => {
            setHasRequested(true);
            generate.mutate(profileId, {
              onSuccess: () =>
                navigate(`/app/perfiles/${profileId}/meta/propuesta`),
            });
          }}
          type="button"
        >
          {!generate.isPending ? (
            <Sparkles aria-hidden="true" size={18} />
          ) : null}
          {generate.isPending ? 'Calculando...' : 'Generar propuesta'}
        </button>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value.length === 10 ? `${value}T00:00:00Z` : value));
}
