import { useNavigate, useParams, useSearchParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  useAddPlannedMeal,
  useUpdatePlannedMeal,
  useWeeklyPlan,
} from '../hooks/useMealPlanning';
import { PlannedMealForm } from '../components/PlannedMealForm';
import type { PlannedMealFormValues } from '@nutrihogar/schemas';
import { isValidCalendarDate, weekDates } from '../../domain/week';

export function PlannedMealFormPage() {
  const { weeklyPlanId, plannedMealId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const plan = useWeeklyPlan(weeklyPlanId);
  const add = useAddPlannedMeal();
  const update = useUpdatePlannedMeal();
  const editing = Boolean(plannedMealId);
  if (households.isPending || plan.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando comida..." />
      </section>
    );
  if (!households.activeHousehold || plan.isError || !plan.data)
    return (
      <section className="page-section">
        <ErrorState message="No se pudo cargar el plan semanal." />
      </section>
    );
  const meal = plan.data.meals.find((item) => item.id === plannedMealId);
  if (editing && !meal)
    return (
      <section className="page-section">
        <ErrorState message="No se encontró la comida planificada." />
      </section>
    );
  const dates = weekDates(plan.data.weekStart);
  if (!dates.length)
    return (
      <section className="page-section" role="alert">
        <h1>No se puede abrir esta comida</h1>
        <p>
          El plan recibido no tiene una semana válida. Vuelve al plan semanal e
          inténtalo nuevamente.
        </p>
        <BackButton fallback="/app/plan-semanal" />
      </section>
    );
  const requestedDate = params.get('fecha');
  const date =
    requestedDate &&
    isValidCalendarDate(requestedDate) &&
    dates.includes(requestedDate)
      ? requestedDate
      : meal?.date && dates.includes(meal.date)
        ? meal.date
        : dates[0];
  const type = (params.get('tipo') ??
    meal?.type ??
    'BREAKFAST') as PlannedMealFormValues['type'];
  const back = `/app/plan-semanal?semana=${plan.data.weekStart}`;
  function submit(value: PlannedMealFormValues) {
    const input = {
      ...value,
      recipeId: value.recipeId || null,
      previousMealId: value.previousMealId || null,
      nameSnapshot: value.nameSnapshot || null,
    };
    if (editing && plannedMealId)
      update.mutate(
        { plannedMealId, input },
        { onSuccess: () => navigate(back) },
      );
    else
      add.mutate(
        { weeklyPlanId: weeklyPlanId!, input },
        { onSuccess: () => navigate(back) },
      );
  }
  return (
    <section
      className="page-section meal-planning-form-page"
      aria-labelledby="planned-meal-title"
    >
      <BackButton fallback={back} />
      <PlannedMealForm
        householdId={households.activeHousehold.id}
        initialDate={date}
        initialType={type}
        meal={meal}
        plan={plan.data}
        saving={add.isPending || update.isPending}
        error={
          add.isError || update.isError
            ? 'No se pudo guardar la comida. Tus datos siguen en el formulario.'
            : undefined
        }
        onCancel={() => navigate(back)}
        onSubmit={submit}
      />
    </section>
  );
}
