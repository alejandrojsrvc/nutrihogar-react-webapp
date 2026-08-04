import { Link, Navigate, useLocation } from 'react-router';
import type { CSSProperties, ReactNode } from 'react';
import {
  AlertTriangle,
  Beef,
  Check,
  ChevronRight,
  CircleCheck,
  CircleDot,
  Clock3,
  Coffee,
  Flame,
  House,
  Moon,
  PackageCheck,
  Plus,
  Sun,
  Utensils,
  Wheat,
} from 'lucide-react';
import { formatCalories } from '@nutrihogar/domain';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useDailyNutritionSummary } from '../../../meals/presentation/hooks/useMeals';
import {
  useInventoryDashboard,
  useInventorySyncStatus,
} from '../../../inventory/presentation/hooks/useInventory';
import { useWeeklyPlanForWeek } from '../../../meal-planning/presentation/hooks/useMealPlanning';
import {
  canonicalWeekStart,
  todayInTimezone,
} from '../../../meal-planning/domain/week';
import { useActiveProfile } from '../../../../shared/presentation/providers/ActiveProfileContext';
import '../home.css';

const mealTypes = [
  ['BREAKFAST', 'Desayuno'],
  ['LUNCH', 'Almuerzo'],
  ['SNACK', 'Merienda'],
  ['DINNER', 'Cena'],
] as const;

export function HomePage() {
  const location = useLocation();
  const {
    activeHousehold,
    households,
    isError: householdsError,
    isPending: householdsPending,
    selectActiveHousehold,
  } = useHouseholds();
  const profilesQuery = useAdultProfiles(activeHousehold?.id);
  const { activeProfileId } = useActiveProfile();
  const activeProfiles = profilesQuery.profiles.filter(
    (profile) => profile.isActive !== false,
  );
  const profileId = activeProfileId || activeProfiles[0]?.id || '';
  const date = todayInTimezone(activeHousehold?.timezone ?? 'UTC');
  const summaryQuery = useDailyNutritionSummary(profileId, date);
  const inventoryDashboard = useInventoryDashboard(activeHousehold?.id);
  const inventorySyncQuery = useInventorySyncStatus(activeHousehold?.id);
  const todayPlan = useWeeklyPlanForWeek(
    activeHousehold?.id,
    canonicalWeekStart(date),
  );

  if (householdsPending) {
    return (
      <section className="page-section" aria-labelledby="home-loading-title">
        <p className="lead" role="status">
          Consultando tus hogares...
        </p>
      </section>
    );
  }
  if (householdsError) {
    return (
      <section className="page-section" aria-labelledby="home-error-title">
        <p className="lead" role="alert">
          No se pudo conectar con la API de NutriHogar.
        </p>
      </section>
    );
  }
  if (households.length === 0) return <Navigate replace to="/onboarding" />;
  if (!activeHousehold) {
    return (
      <section
        className="page-section"
        aria-labelledby="household-select-title"
      >
        <p className="lead">
          Selecciona el espacio familiar que quieres consultar.
        </p>
        <div className="household-list" role="list">
          {households.map((household) => (
            <button
              className="household-list__item"
              key={household.id}
              onClick={() => selectActiveHousehold(household)}
              type="button"
            >
              <span>{household.name}</span>
              <small>{household.currency}</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="page-section home-page" aria-labelledby="home-title">
      {isSuccessNavigation(location.state) ? (
        <p className="profile-success" role="status">
          {location.state.mealSaved
            ? 'Comida registrada correctamente.'
            : 'Perfil guardado correctamente.'}
        </p>
      ) : null}
      <div className="home-page__layout">
        {summaryQuery.data ? (
          <>
            <div className="home-page__main-column">
              <HomeNutritionSummary summary={summaryQuery.data} />
              <HomeMealTimeline
                date={date}
                plan={todayPlan}
                summary={summaryQuery.data}
              />
            </div>
            <aside
              className="home-page__side-column"
              aria-label="Resumen del hogar"
            >
              <HomeNextMeal
                date={date}
                plan={todayPlan}
                summary={summaryQuery.data}
              />
            </aside>
          </>
        ) : (
          <section className="home-page__nutrition" aria-live="polite">
            <h2>{profileId ? 'Resumen nutricional' : 'Configura tu perfil'}</h2>
            <p role={summaryQuery.isError ? 'alert' : 'status'}>
              {!profileId
                ? 'Completa un perfil activo para consultar el resumen del día.'
                : summaryQuery.isError
                  ? 'No se pudo cargar el resumen de hoy.'
                  : 'Cargando tu resumen...'}
            </p>
          </section>
        )}
        <HomeInventoryPulse
          dashboard={inventoryDashboard}
          sync={inventorySyncQuery.data}
        />
      </div>
    </section>
  );
}

function HomeNutritionSummary({
  summary,
}: {
  summary: NonNullable<ReturnType<typeof useDailyNutritionSummary>['data']>;
}) {
  const goal = summary.goal;
  const calorieGoal = goal?.calories ?? 0;
  const consumedCalories = summary.consumed.calories;
  const remainingCalories = Math.max(calorieGoal - consumedCalories, 0);
  const calorieProgress = progress(consumedCalories, calorieGoal);
  const hasGoal = calorieGoal > 0;

  return (
    <section
      className="home-page__nutrition"
      aria-labelledby="home-nutrition-title"
    >
      <h2 id="home-nutrition-title" className="visually-hidden">
        Resumen nutricional de hoy
      </h2>
      <div className="home-nutrition__overview">
        <div
          className="home-calorie-ring"
          role="progressbar"
          aria-label="Calorías consumidas"
          aria-valuemax={Math.max(calorieGoal, consumedCalories, 1)}
          aria-valuemin={0}
          aria-valuenow={consumedCalories}
          style={
            { '--calorie-progress': `${calorieProgress}%` } as CSSProperties
          }
        >
          <div>
            <Flame size={15} aria-hidden="true" />
            <strong>{formatCaloriesNumber(consumedCalories)}</strong>
            <small>kcal</small>
          </div>
        </div>
        <div className="home-nutrition__copy">
          <p>
            <strong>{formatCalories(consumedCalories)}</strong> consumidas
          </p>
          <p className="home-nutrition__remaining">
            {formatCalories(remainingCalories)} restantes
          </p>
          <p className="home-nutrition__goal">
            Objetivo diario: {formatCalories(calorieGoal)}
          </p>
          <div className="home-page__calorie-track" aria-hidden="true">
            <span style={{ width: `${calorieProgress}%` }} />
          </div>
        </div>
        <div className="home-nutrition__encouragement">
          {hasGoal ? <CircleCheck size={31} aria-hidden="true" /> : null}
          <p>
            {hasGoal ? (
              <>
                <strong>¡Vas genial!</strong>
                <br />
                Sigue con tu objetivo diario.
              </>
            ) : (
              'Configura tu objetivo diario para ver tu progreso.'
            )}
          </p>
        </div>
      </div>
      <div className="home-page__macros">
        <NutritionMetric
          icon={<Beef size={18} />}
          label="Proteína"
          value={summary.consumed.proteinGrams}
          goal={goal?.proteinGrams}
          tone="protein"
        />
        <NutritionMetric
          icon={<Wheat size={18} />}
          label="Carbohidratos"
          value={summary.consumed.carbohydrateGrams}
          goal={goal?.carbohydrateGrams}
          tone="carbohydrates"
        />
        <NutritionMetric
          icon={<CircleDot size={18} />}
          label="Grasas"
          value={summary.consumed.fatGrams}
          goal={goal?.fatGrams}
          tone="fat"
        />
      </div>
    </section>
  );
}

function NutritionMetric({
  goal,
  icon,
  label,
  tone,
  value,
}: {
  goal?: number;
  icon: ReactNode;
  label: string;
  tone: 'protein' | 'carbohydrates' | 'fat';
  value: number;
}) {
  const percentage = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div className={`home-macro home-macro--${tone}`}>
      <div className="home-macro__content">
        <span className="home-macro__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="home-macro__copy">
          <strong>{label}</strong>
          <span>
            {Math.round(value)} / {goal == null ? '—' : `${Math.round(goal)} g`}
          </span>
        </div>
      </div>
      <div className="home-macro__track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
      <small>{goal == null ? 'Sin objetivo' : `${percentage}%`}</small>
    </div>
  );
}

function HomeNextMeal({
  date,
  plan,
  summary,
}: {
  date: string;
  plan: ReturnType<typeof useWeeklyPlanForWeek>;
  summary: NonNullable<ReturnType<typeof useDailyNutritionSummary>['data']>;
}) {
  const registered = new Set(summary.meals.map((meal) => meal.mealType));
  const nextMeal = (plan.data?.meals ?? []).find(
    (meal) =>
      meal.date === date &&
      !['CANCELLED', 'REPLACED', 'SKIPPED'].includes(meal.status) &&
      !registered.has(meal.type),
  );

  return (
    <section className="home-next-meal" aria-labelledby="home-next-meal-title">
      <div className="home-card__heading">
        <Clock3 size={19} aria-hidden="true" />
        <h2 id="home-next-meal-title">Próximo</h2>
      </div>
      {plan.isPending ? (
        <p className="home-card__muted" role="status">
          Cargando tu próxima comida...
        </p>
      ) : null}
      {plan.isError ? (
        <p className="home-card__muted" role="alert">
          No se pudo cargar el plan de hoy.
        </p>
      ) : null}
      {!plan.isPending && !plan.isError && nextMeal ? (
        <>
          <div className="home-next-meal__body">
            <p className="home-next-meal__type">{mealLabel(nextMeal.type)}</p>
            <strong>{nextMeal.name ?? sourceLabel(nextMeal.source)}</strong>
            <span>Comida planificada</span>
          </div>
          <Link className="home-card__link" to="/app/plan-semanal">
            Ver detalles <ChevronRight size={17} aria-hidden="true" />
          </Link>
        </>
      ) : null}
      {!plan.isPending && !plan.isError && !nextMeal ? (
        <p className="home-card__muted">
          No hay una próxima comida planificada.
        </p>
      ) : null}
    </section>
  );
}

function HomeMealTimeline({
  date,
  plan,
  summary,
}: {
  date: string;
  plan: ReturnType<typeof useWeeklyPlanForWeek>;
  summary: NonNullable<ReturnType<typeof useDailyNutritionSummary>['data']>;
}) {
  const registered = new Map(
    summary.meals.map((meal) => [meal.mealType, meal]),
  );
  const planned = new Map(
    (plan.data?.meals ?? [])
      .filter((meal) => meal.date === date)
      .map((meal) => [meal.type, meal]),
  );
  return (
    <section className="home-page__meals" aria-labelledby="home-meals-title">
      <div className="home-card__heading">
        <Utensils size={19} aria-hidden="true" />
        <h2 id="home-meals-title">Comidas de hoy</h2>
      </div>
      {plan.isError ? (
        <p role="alert">No se pudieron cargar las comidas planificadas.</p>
      ) : null}
      <div className="home-meal-timeline__head" aria-hidden="true">
        <span />
        <span>Comida</span>
        <span>Consumido</span>
        <span>Estado</span>
        <span />
      </div>
      <ul className="home-meal-timeline">
        {mealTypes.map(([type, label]) => {
          const meal = registered.get(type);
          const plannedMeal = planned.get(type);
          return (
            <li className={meal ? 'is-complete' : ''} key={type}>
              <span className="home-meal-timeline__marker" aria-hidden="true">
                {meal ? <Check size={17} /> : mealIcon(type)}
              </span>
              <div>
                <strong>{label}</strong>
                {meal ? (
                  <Link to={`/app/comidas/${meal.id}`}>
                    {meal.preparation?.recipeName ?? 'Comida registrada'}
                  </Link>
                ) : plannedMeal ? (
                  <span>
                    {plannedMeal.name ?? sourceLabel(plannedMeal.source)}
                  </span>
                ) : (
                  <span className="home-meal-timeline__subtext">
                    Sin registrar
                  </span>
                )}
              </div>
              <span className="home-meal-timeline__calories">
                {meal ? formatCalories(meal.totals.calories) : '—'}
              </span>
              <span
                className={`home-meal-timeline__status${meal ? ' is-complete' : plannedMeal?.status === 'CANCELLED' ? ' is-cancelled' : ''}`}
              >
                {meal
                  ? 'Registrado'
                  : plannedMeal?.status === 'CANCELLED'
                    ? 'Cancelada'
                    : plannedMeal
                      ? 'Pendiente'
                      : 'Sin registrar'}
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </li>
          );
        })}
      </ul>
      <Link
        className="button button--primary home-page__primary-action"
        to={`/app/comidas/nueva?profileId=${summary.profile.id}&date=${date}`}
      >
        <Plus size={20} aria-hidden="true" /> Registrar comida
      </Link>
    </section>
  );
}

function HomeInventoryPulse({
  dashboard,
  sync,
}: {
  dashboard: ReturnType<typeof useInventoryDashboard>;
  sync?: {
    isOnline: boolean;
    pendingCount: number;
    conflictsCount: number;
    lastSyncAt: string | null;
  };
}) {
  const inventory = dashboard.inventory.data?.items ?? [];
  const critical = [...inventory]
    .filter(
      (item) =>
        item.status === 'DEPLETED' ||
        item.currentQuantity <= 0 ||
        (item.minimumQuantity != null &&
          item.currentQuantity <= item.minimumQuantity) ||
        isExpiring(item.expiresAt),
    )
    .sort((a, b) => priority(a) - priority(b))
    .slice(0, 3);
  return (
    <section
      className="home-page__inventory-pulse"
      aria-labelledby="home-inventory-pulse-title"
    >
      <div className="home-card__heading">
        <House size={19} aria-hidden="true" />
        <h2 id="home-inventory-pulse-title">En casa</h2>
        <Link to="/app/inventario" aria-label="Ver inventario">
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      </div>
      {dashboard.inventory.isError ? (
        <p role="alert">No se pudo cargar el inventario.</p>
      ) : null}
      {critical.length ? (
        <ul className="home-pulse-list">
          {critical.map((item) => (
            <li key={item.id}>
              <Link
                to={
                  item.itemType === 'PREPARED_FOOD'
                    ? `/app/inventario/${item.id}/consumir-preparado`
                    : `/app/inventario/${item.id}`
                }
              >
                <span className="home-pulse-list__name">
                  <span className="home-pulse-list__icon" aria-hidden="true">
                    {item.status === 'DEPLETED' || item.currentQuantity <= 0 ? (
                      <AlertTriangle size={17} />
                    ) : (
                      <PackageCheck size={17} />
                    )}
                  </span>
                  <strong>{item.name}</strong>
                </span>
                <small>
                  {item.status === 'DEPLETED' || item.currentQuantity <= 0
                    ? 'Agotado'
                    : item.minimumQuantity != null &&
                        item.currentQuantity <= item.minimumQuantity
                      ? 'Bajo mínimo'
                      : 'Próximo a vencer'}
                </small>
              </Link>
            </li>
          ))}
        </ul>
      ) : dashboard.inventory.isPending ? (
        <p role="status">Cargando alertas del inventario...</p>
      ) : dashboard.inventory.isError ? null : (
        <p>El inventario no tiene alertas prioritarias.</p>
      )}
      <p className="supporting-text">
        {sync?.isOnline === false
          ? 'Sin conexión: se muestran los datos guardados en este dispositivo.'
          : sync?.pendingCount
            ? `${sync.pendingCount} operación${sync.pendingCount === 1 ? '' : 'es'} pendiente${sync.pendingCount === 1 ? '' : 's'} de sincronizar.`
            : sync?.conflictsCount
              ? `${sync.conflictsCount} conflicto${sync.conflictsCount === 1 ? '' : 's'} requiere${sync.conflictsCount === 1 ? '' : 'n'} revisión.`
              : sync?.lastSyncAt
                ? `Última sincronización: ${formatTime(sync.lastSyncAt)}`
                : 'Inventario y compras al día.'}
      </p>
    </section>
  );
}

function priority(item: {
  status: string;
  currentQuantity: number;
  minimumQuantity: number | null;
  expiresAt: string | null;
}) {
  return item.status === 'DEPLETED' || item.currentQuantity <= 0
    ? 0
    : item.minimumQuantity != null &&
        item.currentQuantity <= item.minimumQuantity
      ? 1
      : item.expiresAt
        ? new Date(item.expiresAt).getTime()
        : 2;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function isSuccessNavigation(
  state: unknown,
): state is { mealSaved?: boolean; profileSaved?: boolean } {
  return (
    typeof state === 'object' &&
    state !== null &&
    ('mealSaved' in state || 'profileSaved' in state)
  );
}

function isExpiring(value: string | null) {
  return (
    value != null &&
    value <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  );
}

function progress(value: number, goal: number) {
  return goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
}

function formatCaloriesNumber(value: number) {
  return formatCalories(value).replace(/\s*kcal$/, '');
}

function sourceLabel(source: string) {
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

function mealLabel(type: string) {
  return mealTypes.find(([mealType]) => mealType === type)?.[1] ?? type;
}

function mealIcon(type: string) {
  if (type === 'BREAKFAST') return <Sun size={18} />;
  if (type === 'SNACK') return <Coffee size={18} />;
  if (type === 'DINNER') return <Moon size={18} />;
  return <Utensils size={18} />;
}
