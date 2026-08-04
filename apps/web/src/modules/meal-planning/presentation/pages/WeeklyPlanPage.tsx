import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import type { MealType, PlannedMeal } from '../../domain/MealPlanning';
import {
  canonicalWeekStart,
  formatDate,
  isValidCalendarDate,
  todayInTimezone,
  weekDates,
} from '../../domain/week';
import {
  useCreateWeeklyPlan,
  useWeeklyPlanForWeek,
} from '../hooks/useMealPlanning';
import { RelatedActions } from '../components/RelatedActions';
import '../meal-planning.css';

const mealTypes: Array<[MealType, string]> = [
  ['BREAKFAST', 'Desayuno'],
  ['LUNCH', 'Comida'],
  ['DINNER', 'Cena'],
  ['SNACK', 'Colación'],
];
const statusLabels: Record<PlannedMeal['status'], string> = {
  CANCELLED: 'Cancelada',
  CONSUMED: 'Consumida',
  PLANNED: 'Planificada',
  PREPARED: 'Preparada',
  REPLACED: 'Sustituida',
  SERVED: 'Servida',
  SKIPPED: 'Omitida',
};

export function WeeklyPlanPage() {
  const households = useHouseholds();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const timezone = households.activeHousehold?.timezone ?? 'UTC';
  const requestedDate = params.get('semana');
  const safeRequestedDate =
    requestedDate && isValidCalendarDate(requestedDate)
      ? requestedDate
      : todayInTimezone(timezone);
  const weekStart = canonicalWeekStart(safeRequestedDate);
  const plan = useWeeklyPlanForWeek(households.activeHousehold?.id, weekStart);
  const create = useCreateWeeklyPlan();

  useEffect(() => {
    if (params.get('semana') !== weekStart) {
      const next = new URLSearchParams(params);
      next.set('semana', weekStart);
      setParams(next, { replace: true });
    }
  }, [params, setParams, weekStart]);

  if (households.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando hogar..." />
      </section>
    );
  if (households.isError)
    return (
      <section className="page-section">
        <ErrorState message="No se pudo cargar el hogar." />
      </section>
    );
  if (!households.activeHousehold)
    return (
      <section className="page-section">
        <ErrorState message="No tienes un hogar activo." />
      </section>
    );
  if (plan.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando plan semanal..." />
      </section>
    );
  if (plan.isError)
    return (
      <section className="page-section">
        <ErrorState
          message="No se pudo cargar el plan semanal."
          action={
            <button
              className="button button--secondary"
              onClick={() => void plan.refetch()}
              type="button"
            >
              Reintentar
            </button>
          }
        />
      </section>
    );

  const value = plan.data;
  const dates = weekDates(weekStart);
  const selectedDate = dates.includes(params.get('dia') ?? '')
    ? (params.get('dia') as string)
    : dates[0];
  const selectedDateIndex = dates.indexOf(selectedDate);
  const navigateWeek = (offset: number) =>
    setParams({ semana: shiftWeek(weekStart, offset) });
  const navigateDay = (offset: number) =>
    setParams({
      semana: weekStart,
      dia: dates[(selectedDateIndex + offset + dates.length) % dates.length],
    });
  const createPlan = () =>
    create.mutate(
      { householdId: households.activeHousehold!.id, weekStart },
      {
        onSuccess: (created) =>
          navigate(
            `/app/plan-semanal/${created.id}/comidas/nueva?fecha=${weekStart}&tipo=BREAKFAST`,
          ),
      },
    );

  return (
    <section
      className="page-section meal-planning"
      aria-labelledby="weekly-plan-title"
    >
      <div className="meal-planning__navigation">
        <button
          aria-label="Semana anterior"
          className="icon-button"
          onClick={() => navigateWeek(-1)}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <strong>
          {formatDate(weekStart, timezone, { month: 'long' })} -{' '}
          {formatDate(dates[6], timezone)}
        </strong>
        <button
          aria-label="Semana siguiente"
          className="icon-button"
          onClick={() => navigateWeek(1)}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      {!value ? (
        <EmptyState
          title="Aún no hay plan para esta semana"
          description="Créalo cuando quieras organizar las comidas del hogar."
        >
          <button
            className="button button--primary"
            disabled={create.isPending}
            onClick={createPlan}
            type="button"
          >
            <Plus size={18} />
            {create.isPending ? 'Creando...' : 'Crear plan semanal'}
          </button>
          {create.isError ? (
            <p role="alert">
              No se pudo crear el plan semanal. Inténtalo nuevamente.
            </p>
          ) : null}
        </EmptyState>
      ) : (
        <>
          <p aria-live="polite" className="meal-planning__announcement">
            Plan semanal cargado.{' '}
            {value.meals.length
              ? `${value.meals.length} comida${value.meals.length === 1 ? '' : 's'} planificada${value.meals.length === 1 ? '' : 's'}.`
              : 'Todavía no hay comidas.'}
          </p>
          <div
            className="meal-planning__mobile-day-navigation"
            aria-label="Navegar por día"
          >
            <button
              aria-label="Día anterior"
              className="icon-button"
              onClick={() => navigateDay(-1)}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <strong>
              {formatDate(selectedDate, timezone, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </strong>
            <button
              aria-label="Día siguiente"
              className="icon-button"
              onClick={() => navigateDay(1)}
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <nav className="meal-planning__day-selector" aria-label="Elegir día">
            {dates.map((date) => (
              <Link
                aria-current={date === selectedDate ? 'date' : undefined}
                key={date}
                to={`?semana=${weekStart}&dia=${date}`}
              >
                <span>{formatDate(date, timezone, { weekday: 'short' })}</span>
                <strong>
                  {formatDate(date, timezone, { day: 'numeric' })}
                </strong>
              </Link>
            ))}
          </nav>
          <div className="meal-planning__calendar meal-planning__calendar--mobile">
            {[selectedDate].map((date) => (
              <MealPlanningDay
                date={date}
                key={date}
                planId={value.id}
                meals={value.meals}
                timezone={timezone}
              />
            ))}
          </div>
          <div className="meal-planning__calendar meal-planning__calendar--desktop">
            {dates.map((date) => (
              <MealPlanningDay
                date={date}
                key={date}
                planId={value.id}
                meals={value.meals}
                timezone={timezone}
              />
            ))}
          </div>
          <RelatedActions label="Resumen del plan">
            <Link to={`/app/plan-semanal/${value.id}/requerimientos`}>
              Ingredientes requeridos
            </Link>
            <Link to={`/app/plan-semanal/${value.id}/comparacion-inventario`}>
              Comparar inventario
            </Link>
            <Link to={`/app/plan-semanal/${value.id}/adherencia`}>
              Ver adherencia
            </Link>
          </RelatedActions>
        </>
      )}
    </section>
  );
}

function MealPlanningDay({
  date,
  meals,
  planId,
  timezone,
}: {
  date: string;
  meals: PlannedMeal[];
  planId: string;
  timezone: string;
}) {
  return (
    <section className="meal-planning__day">
      <header className="meal-planning__day-header">
        <h2>{formatDate(date, timezone, { weekday: 'long' })}</h2>
        <time dateTime={date}>
          {formatDate(date, timezone, { day: 'numeric', month: 'short' })}
        </time>
      </header>
      <div className="meal-planning__day-body">
        {mealTypes.map(([type, label]) => (
          <MealSlot
            date={date}
            label={label}
            meals={meals
              .filter((meal) => meal.date === date && meal.type === type)
              .sort((a, b) => a.position - b.position)}
            planId={planId}
            type={type}
            key={type}
          />
        ))}
        <ExtraMeals
          meals={meals.filter(
            (meal) => meal.date === date && meal.type === 'EXTRA',
          )}
          planId={planId}
        />
      </div>
    </section>
  );
}

function MealSlot({
  date,
  label,
  meals,
  planId,
  type,
}: {
  date: string;
  label: string;
  meals: PlannedMeal[];
  planId: string;
  type: MealType;
}) {
  return (
    <section className="meal-planning__slot">
      <h3>{label}</h3>
      {meals.length ? (
        meals.map((meal) => (
          <PlannedMealCard key={meal.id} meal={meal} planId={planId} />
        ))
      ) : (
        <Link
          className="meal-planning__empty-slot"
          to={`/app/plan-semanal/${planId}/comidas/nueva?fecha=${date}&tipo=${type}`}
        >
          Agregar comida
        </Link>
      )}
    </section>
  );
}

function ExtraMeals({
  meals,
  planId,
}: {
  meals: PlannedMeal[];
  planId: string;
}) {
  if (!meals.length) return null;
  return (
    <section className="meal-planning__slot meal-planning__extras">
      <h3>Otras comidas</h3>
      {meals
        .sort((a, b) => a.position - b.position)
        .map((meal) => (
          <PlannedMealCard key={meal.id} meal={meal} planId={planId} />
        ))}
    </section>
  );
}

function PlannedMealCard({
  meal,
  planId,
}: {
  meal: PlannedMeal;
  planId: string;
}) {
  return (
    <article className="meal-planning__card">
      <div className="meal-planning__meal-summary">
        <strong>{meal.name ?? sourceLabel(meal.source)}</strong>
        <span>{statusLabels[meal.status]}</span>
      </div>
      <p>
        {sourceLabel(meal.source)} · {meal.participants.length} participante
        {meal.participants.length === 1 ? '' : 's'}
      </p>
      <nav
        className="meal-planning__quick-actions"
        aria-label={`Acciones para ${meal.name ?? sourceLabel(meal.source)}`}
      >
        <Link to={`/app/plan-semanal/${planId}/comidas/${meal.id}/editar`}>
          Editar
        </Link>
        <Link
          to={`/app/plan-semanal/${planId}/comidas/${meal.id}/participantes`}
        >
          Participantes
        </Link>
        <Link to={`/app/plan-semanal/${planId}/comidas/${meal.id}/cantidades`}>
          Cantidades
        </Link>
        {meal.source === 'RECIPE' && meal.status === 'PLANNED' ? (
          <Link to={`/app/plan-semanal/${planId}/comidas/${meal.id}/preparar`}>
            Preparar
          </Link>
        ) : null}
        {meal.mealId ? (
          <Link to={`/app/comidas/${meal.mealId}`}>Ver consumo</Link>
        ) : meal.status === 'PLANNED' && meal.source !== 'EMPTY' ? (
          <Link
            to={`/app/comidas/nueva?mealType=${meal.type}&date=${meal.date}&plannedMealId=${meal.id}`}
          >
            Registrar consumo
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

function sourceLabel(source: PlannedMeal['source']) {
  return (
    (
      {
        DELIVERY: 'Delivery',
        EMPTY: 'Sin asignar',
        FREE_MEAL: 'Comida libre',
        PREVIOUS_MEAL: 'Comida anterior',
        RECIPE: 'Receta',
        RESTAURANT: 'Restaurante',
        UNPLANNED: 'No planificada',
      } as Record<string, string>
    )[source] ?? source
  );
}
function shiftWeek(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount * 7);
  return value.toISOString().slice(0, 10);
}
