import { Link, useNavigate, useParams } from 'react-router';

import {
  formatCalories,
  formatGrams,
  type NutritionSummary,
} from '@nutrihogar/domain';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useActiveProfile } from '../../../../shared/presentation/providers/ActiveProfileContext';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useDailyNutritionSummary } from '../hooks/useMeals';
import { isPreparedMealSource } from '../../domain/MealOrigin';
import '../meals.css';

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: 'Desayuno',
  DINNER: 'Cena',
  EXTRA: 'Extra',
  LUNCH: 'Almuerzo',
  SNACK: 'Merienda',
};

const nutrients: Array<{
  key: keyof NutritionSummary;
  label: string;
  color: string;
}> = [
  { color: 'protein', key: 'proteinGrams', label: 'Proteína' },
  { color: 'carbohydrates', key: 'carbohydrateGrams', label: 'Carbohidratos' },
  { color: 'fat', key: 'fatGrams', label: 'Grasas' },
  { color: 'fiber', key: 'fiberGrams', label: 'Fibra' },
];

export function DailyNutritionSummaryPage() {
  const navigate = useNavigate();
  const { date = today() } = useParams();
  const households = useHouseholds();
  const profilesQuery = useAdultProfiles(households.activeHousehold?.id);
  const { activeProfile, activeProfileId, profiles, selectActiveProfile } =
    useActiveProfile();
  const summaryQuery = useDailyNutritionSummary(activeProfileId, date);

  function changeDate(value: string) {
    if (value) navigate(`/app/resumen/${value}`);
  }

  if (
    households.isPending ||
    (Boolean(households.activeHousehold) && profilesQuery.isPending)
  ) {
    return (
      <p className="page-section" role="status">
        Cargando integrantes...
      </p>
    );
  }

  if (
    households.isError ||
    !households.activeHousehold ||
    profilesQuery.isError
  ) {
    return (
      <section
        className="page-section summary-page-state"
        aria-labelledby="summary-error-title"
        role="alert"
      >
        <p>Revisa el hogar activo e inténtalo nuevamente.</p>
        <button
          className="button button--secondary"
          onClick={() => {
            void households.refetch();
            void profilesQuery.refetch();
          }}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (profiles.length === 0 || !activeProfile) {
    return (
      <section
        className="page-section"
        aria-labelledby="summary-empty-profile-title"
      >
        <p className="lead">
          Necesitas un perfil adulto para consultar el consumo del día.
        </p>
        <Link className="button button--primary" to="/app/perfil/editar">
          Configurar perfil
        </Link>
      </section>
    );
  }

  return (
    <section
      className="page-section daily-summary-page"
      aria-labelledby="daily-summary-title"
    >
      <div className="summary-filters">
        {profiles.length > 1 ? (
          <div className="summary-filter-pill">
            <label htmlFor="summary-profile">Integrante</label>
            <select
              id="summary-profile"
              value={activeProfileId}
              onChange={(event) => selectActiveProfile(event.target.value)}
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="summary-active-profile">
            <span>Integrante</span>
            <strong>{activeProfile.name}</strong>
          </p>
        )}
        <div className="summary-filter-pill">
          <label htmlFor="summary-date">Fecha</label>
          <input
            id="summary-date"
            type="date"
            value={date}
            onChange={(event) => changeDate(event.target.value)}
          />
        </div>
        <Link
          className="button button--primary summary-filters__action"
          to={`/app/comidas/nueva?profileId=${activeProfileId}&date=${date}`}
        >
          Registrar comida
        </Link>
      </div>

      {summaryQuery.isPending ? (
        <p className="summary-status" role="status">
          Cargando el resumen...
        </p>
      ) : null}
      {summaryQuery.isError ? (
        <div className="summary-error" role="alert">
          <div>
            <h2>No pudimos cargar este día</h2>
            <p>El integrante y la fecha seleccionados se conservaron.</p>
          </div>
          <button
            className="button button--secondary"
            onClick={() => void summaryQuery.refetch()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {summaryQuery.data ? (
        <SummaryContent summary={summaryQuery.data} />
      ) : null}
    </section>
  );
}

function SummaryContent({
  summary,
}: {
  summary: NonNullable<ReturnType<typeof useDailyNutritionSummary>['data']>;
}) {
  return (
    <>
      <div className="daily-summary-heading">
        <div>
          <p className="eyebrow">{formatDate(summary.date)}</p>
          <h2>{summary.profile.name}</h2>
        </div>
        <p className="daily-summary-heading__calories">
          {formatCalories(summary.consumed.calories)} <span>consumidas</span>
        </p>
      </div>
      {!summary.goal ? (
        <EmptyState
          title="Este día no tiene meta"
          description="Puedes consultar el consumo registrado aunque todavía no haya una meta nutricional vigente."
        />
      ) : null}
      <section
        className="nutrition-summary"
        aria-labelledby="nutrition-summary-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Balance nutricional</p>
            <h2 id="nutrition-summary-title">Consumido frente al objetivo</h2>
          </div>
        </div>
        <NutritionMetric
          label="Calorías"
          color="calories"
          consumed={summary.consumed.calories}
          goal={summary.goal?.calories}
          remaining={summary.remaining?.calories}
          unit="kcal"
        />
        {nutrients.map((nutrient) => (
          <NutritionMetric
            key={nutrient.key}
            label={nutrient.label}
            color={nutrient.color}
            consumed={summary.consumed[nutrient.key]}
            goal={summary.goal?.[nutrient.key]}
            remaining={summary.remaining?.[nutrient.key]}
            unit="g"
          />
        ))}
      </section>
      <section className="daily-meals" aria-labelledby="daily-meals-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Registro</p>
            <h2 id="daily-meals-title">Comidas del día</h2>
          </div>
        </div>
        {summary.meals.length === 0 ? (
          <EmptyState
            title="Todavía no hay comidas"
            description="Registra la primera comida de este día para verla aquí."
          />
        ) : (
          <div className="daily-meal-list">
            {summary.meals.map((meal) => (
              <Link
                className="daily-meal"
                key={meal.id}
                to={`/app/comidas/${meal.id}`}
              >
                <span>
                  <strong>
                    {mealTypeLabels[meal.mealType] ?? meal.mealType}
                  </strong>
                  <small>
                    {formatTime(meal.consumedAt)}
                    {isPreparedMealSource(meal.source)
                      ? ' · Preparación familiar'
                      : ''}
                  </small>
                </span>
                <span className="daily-meal__totals">
                  {formatCalories(meal.totals.calories)}
                  <small>Ver detalle</small>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function NutritionMetric({
  color,
  consumed,
  goal,
  label,
  remaining,
  unit,
}: {
  color: string;
  consumed: number;
  goal?: number;
  label: string;
  remaining?: number;
  unit: string;
}) {
  const percentage =
    goal && goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  return (
    <div className={`nutrition-metric nutrition-metric--${color}`}>
      <div className="nutrition-metric__heading">
        <span>{label}</span>
        <strong>
          {formatValue(consumed, unit)}
          {goal == null ? '' : ` / ${formatValue(goal, unit)}`}
        </strong>
      </div>
      {goal != null && goal > 0 ? (
        <>
          <div
            className="nutrition-metric__track"
            role="progressbar"
            aria-label={`${label}: ${formatValue(consumed, unit)} de ${formatValue(goal, unit)}`}
            aria-valuemax={goal}
            aria-valuemin={0}
            aria-valuenow={Math.min(consumed, goal)}
          >
            <span style={{ width: `${percentage}%` }} />
          </div>
          <p className="nutrition-metric__remaining">
            {remaining == null
              ? 'Balance no disponible'
              : remaining > 0
                ? `Restan ${formatValue(remaining, unit)}`
                : remaining < 0
                  ? `${formatValue(Math.abs(remaining), unit)} sobre la referencia`
                  : 'Referencia alcanzada'}
          </p>
        </>
      ) : goal === 0 ? (
        <p className="supporting-text">Referencia registrada en 0 {unit}</p>
      ) : (
        <p className="supporting-text">Sin objetivo para esta fecha</p>
      )}
    </div>
  );
}

function formatValue(value: number, unit: string) {
  return unit === 'kcal' ? formatCalories(value) : formatGrams(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}
function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
function today() {
  const value = new Date();
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
