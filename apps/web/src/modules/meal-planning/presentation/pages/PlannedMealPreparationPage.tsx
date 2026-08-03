import { Link, useNavigate, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import {
  useWeeklyPlan,
  usePlannedMealPreparation,
  usePreparePlannedMeal,
} from '../hooks/useMealPlanning';

export function PlannedMealPreparationPage() {
  const { weeklyPlanId, plannedMealId = '' } = useParams();
  const navigate = useNavigate();
  const plan = useWeeklyPlan(weeklyPlanId);
  const preparation = usePlannedMealPreparation(plannedMealId);
  const prepare = usePreparePlannedMeal();
  const meal = plan.data?.meals.find((item) => item.id === plannedMealId);
  if (plan.isPending || preparation.isPending)
    return (
      <p className="page-section" role="status">
        Cargando preparación...
      </p>
    );
  if (plan.isError || !meal)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la comida planificada.
      </p>
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
  const existing = preparation.data as { id?: string } | undefined;
  const start = () =>
    prepare.mutate(plannedMealId, {
      onSuccess: (batch) =>
        navigate(`/app/preparaciones/${(batch as { id: string }).id}`),
    });
  return (
    <section
      className="page-section preparation-page"
      aria-labelledby="planned-preparation-title"
    >
      <BackButton
        fallback={`/app/plan-semanal?semana=${plan.data.weekStart}`}
      />
      <PageHeader
        eyebrow="Comida planificada"
        title={`Cocinar ${meal.name ?? 'receta'}`}
        titleId="planned-preparation-title"
        description="El backend conserva participantes, cantidades y el estado del plan."
      />
      {preparation.isError ? (
        <p className="supporting-text">
          Aún no existe una preparación para esta comida.
        </p>
      ) : null}
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
    </section>
  );
}
