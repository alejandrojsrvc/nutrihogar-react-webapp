import { Link, useNavigate, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import {
  useWeeklyPlan,
  usePlannedMealPreparation,
  usePreparePlannedMeal,
} from '../hooks/useMealPlanning';
import { RelatedActions } from '../components/RelatedActions';

export function PlannedMealPreparationPage() {
  const { weeklyPlanId, plannedMealId = '' } = useParams();
  const navigate = useNavigate();
  const plan = useWeeklyPlan(weeklyPlanId);
  const preparation = usePlannedMealPreparation(plannedMealId);
  const prepare = usePreparePlannedMeal();
  const meal = plan.data?.meals.find((item) => item.id === plannedMealId);
  if (plan.isPending || preparation.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando preparación..." />
      </section>
    );
  if (plan.isError || !meal)
    return (
      <section className="page-section">
        <ErrorState message="No se pudo cargar la comida planificada." />
      </section>
    );
  if (meal.source !== 'RECIPE' || !meal.recipeId)
    return (
      <section className="page-section" role="alert">
        <BackButton
          fallback={`/app/plan-semanal?semana=${plan.data?.weekStart}`}
        />
        <p>
          Solo las comidas planificadas desde una receta pueden iniciar
          preparación.
        </p>
      </section>
    );
  if (preparation.isError)
    return (
      <section className="page-section meal-planning-detail">
        <BackButton
          fallback={`/app/plan-semanal?semana=${plan.data.weekStart}`}
        />
        <ErrorState
          message="No se pudo consultar la preparación de esta comida."
          action={
            <button
              className="button button--secondary"
              onClick={() => void preparation.refetch()}
              type="button"
            >
              Reintentar
            </button>
          }
        />
      </section>
    );
  const existing = preparation.data as { id?: string } | null | undefined;
  const start = () =>
    prepare.mutate(plannedMealId, {
      onSuccess: (batch) =>
        navigate(`/app/preparaciones/${(batch as { id: string }).id}`),
    });
  return (
    <section
      className="page-section meal-planning-detail preparation-page"
      aria-labelledby="planned-preparation-title"
    >
      <BackButton
        fallback={`/app/plan-semanal?semana=${plan.data.weekStart}`}
      />
      {existing?.id ? (
        <>
          <p role="status">Esta comida ya tiene una preparación.</p>
          <Link
            className="button button--primary"
            to={`/app/preparaciones/${existing.id}`}
          >
            Continuar preparación
          </Link>
        </>
      ) : (
        <button
          className="button button--primary"
          disabled={prepare.isPending}
          onClick={start}
          type="button"
        >
          {prepare.isPending ? 'Iniciando...' : 'Iniciar preparación'}
        </button>
      )}
      {prepare.isError ? (
        <p role="alert">No se pudo iniciar la preparación.</p>
      ) : null}
      <RelatedActions>
        <Link
          to={`/app/plan-semanal/${weeklyPlanId}/comidas/${plannedMealId}/cantidades`}
        >
          Revisar cantidades
        </Link>
        <Link to={`/app/plan-semanal?semana=${plan.data.weekStart}`}>
          Volver al plan
        </Link>
      </RelatedActions>
    </section>
  );
}
