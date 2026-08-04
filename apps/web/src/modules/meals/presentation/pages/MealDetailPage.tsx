import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { formatCalories, formatGrams } from '@nutrihogar/domain';
import { Repeat2 } from 'lucide-react';
import { useActiveProfile } from '../../../../shared/presentation/providers/ActiveProfileContext';
import { useCancelMeal, useMealDetails } from '../hooks/useMeals';
import { isPreparedMealSource } from '../../domain/MealOrigin';
import '../meals.css';

const statusLabels: Record<string, string> = {
  CANCELLED: 'Comida cancelada',
  CONFIRMED: 'Confirmada',
};

const unitLabels: Record<string, string> = {
  GRAM: 'g',
  MILLILITER: 'ml',
  SERVING: 'porción(es)',
  UNIT: 'unidad(es)',
};

const methodLabels: Record<string, string> = {
  APPROXIMATED: 'Aproximado',
  SERVING: 'Por porción',
  UNIT: 'Por unidad',
  WEIGHED: 'Pesado',
};

export function MealDetailPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profiles } = useActiveProfile();
  const query = useMealDetails(mealId);
  const cancelMeal = useCancelMeal();

  if (query.isPending)
    return (
      <p className="page-section" role="status">
        Cargando detalle...
      </p>
    );
  if (query.isError || !query.data) {
    return (
      <section className="page-section" role="alert">
        <p>No se pudo cargar el detalle de la comida.</p>
        <button
          className="button button--secondary"
          onClick={() => void query.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  }

  const meal = query.data;
  const profileName =
    profiles.find((profile) => profile.id === meal.adultProfileId)?.name ??
    'Integrante no disponible';
  const editDisabledReason = getEditDisabledReason(meal);
  const feedback = getMealFeedback(location.state);
  function cancel() {
    const warning =
      isPreparedMealSource(meal.source) || meal.preparation
        ? 'Esta comida está vinculada a una porción de una preparación. Cancelarla no deshace el consumo de la preparación. ¿Quieres continuar?'
        : 'Cancelar esta comida hará que deje de contar en el resumen diario. ¿Quieres continuar?';
    if (!mealId || !window.confirm(warning)) return;
    cancelMeal.mutate(mealId, {
      onSuccess: () =>
        navigate(`/app/resumen/${meal.consumedAt.slice(0, 10)}`, {
          state: { mealCancelled: true },
        }),
    });
  }
  return (
    <section
      className="page-section meal-detail-page"
      aria-labelledby="meal-detail-title"
    >
      <p className="supporting-text">{formatDateTime(meal.consumedAt)}</p>
      {feedback ? (
        <p className="meal-feedback" role="status">
          {feedback}
        </p>
      ) : null}
      {meal.status !== 'CONFIRMED' ? (
        <p className="status-badge" role="status">
          {statusLabels[meal.status] ?? meal.status}
        </p>
      ) : null}
      {editDisabledReason ? (
        <p className="meal-disabled-reason" id="meal-edit-disabled-reason">
          <strong>Edición no disponible.</strong> {editDisabledReason}
        </p>
      ) : null}
      <dl className="meal-detail-meta">
        <div>
          <dt>Integrante</dt>
          <dd>{profileName}</dd>
        </div>
        <div>
          <dt>Origen</dt>
          <dd>
            {isPreparedMealSource(meal.source) || meal.preparation
              ? 'Preparación familiar'
              : meal.source === 'MANUAL'
                ? 'Registro manual'
                : meal.source}
          </dd>
        </div>
        {meal.preparation?.recipeName ? (
          <div>
            <dt>Receta</dt>
            <dd>{meal.preparation.recipeName}</dd>
          </div>
        ) : null}
        {meal.preparation?.consumedWeight != null ? (
          <div>
            <dt>Peso consumido</dt>
            <dd>{meal.preparation.consumedWeight} g · Pesado</dd>
          </div>
        ) : null}
      </dl>
      <section
        className="meal-detail-summary"
        aria-labelledby="meal-detail-summary-title"
      >
        <p className="eyebrow">Resumen confirmado</p>
        <h2 id="meal-detail-summary-title">Nutrientes de la comida</h2>
        <dl className="nutrition-value-list">
          <div>
            <dt>Calorías</dt>
            <dd>{formatCalories(meal.totals.calories)}</dd>
          </div>
          <div>
            <dt>Proteína</dt>
            <dd>{formatGrams(meal.totals.proteinGrams)}</dd>
          </div>
          <div>
            <dt>Carbohidratos</dt>
            <dd>{formatGrams(meal.totals.carbohydrateGrams)}</dd>
          </div>
          <div>
            <dt>Grasas</dt>
            <dd>{formatGrams(meal.totals.fatGrams)}</dd>
          </div>
          <div>
            <dt>Fibra</dt>
            <dd>{formatGrams(meal.totals.fiberGrams)}</dd>
          </div>
        </dl>
      </section>
      <section
        className="meal-detail-items"
        aria-labelledby="meal-detail-items-title"
      >
        <h2 id="meal-detail-items-title">Alimentos</h2>
        {meal.items.length === 0 ? (
          <p className="empty-copy">
            Este registro no contiene alimentos para mostrar.
          </p>
        ) : (
          <ul>
            {meal.items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.foodName}</strong>
                  <span>
                    {item.quantity}{' '}
                    {unitLabels[item.unit] ?? item.unit.toLowerCase()}
                  </span>
                  <small>
                    {methodLabels[item.measurementMethod] ??
                      'Medición aproximada'}
                    {item.preparationState ? ` · ${item.preparationState}` : ''}
                  </small>
                </div>
                <dl className="meal-detail-item-nutrients">
                  {item.nutrients.map((nutrient) => (
                    <div key={`${item.id}-${nutrient.code}`}>
                      <dt>{nutrient.name}</dt>
                      <dd>
                        {nutrient.amount} {nutrient.unit}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
      {meal.notes ? (
        <p className="meal-detail-notes">
          <strong>Nota:</strong> {meal.notes}
        </p>
      ) : null}
      {meal.preparation?.preparedBatchId ? (
        <Link
          className="button button--secondary"
          to={`/app/preparaciones/${meal.preparation.preparedBatchId}`}
        >
          Ver preparación original
        </Link>
      ) : null}
      <div className="meal-detail-actions">
        <Link
          className="button button--secondary"
          to={`/app/comidas/${meal.id}/repetir`}
        >
          <Repeat2 aria-hidden="true" size={18} />
          Repetir comida
        </Link>
        <button
          className="button button--danger"
          disabled={meal.status !== 'CONFIRMED' || cancelMeal.isPending}
          onClick={cancel}
          type="button"
        >
          {cancelMeal.isPending ? 'Cancelando...' : 'Cancelar comida'}
        </button>
        {cancelMeal.isError ? (
          <p role="alert">
            No se pudo cancelar la comida. Inténtalo nuevamente.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function getEditDisabledReason(
  meal: NonNullable<ReturnType<typeof useMealDetails>['data']>,
) {
  if (meal.status !== 'CONFIRMED') {
    return 'Las comidas canceladas se conservan como historial y no pueden modificarse.';
  }
  if (meal.items.some((item) => item.foodId === null)) {
    return 'Uno o más alimentos existen solo como una captura histórica. Para conservarlos sin cambios, esta comida no se puede editar.';
  }
  return null;
}

function getMealFeedback(state: unknown) {
  if (!state || typeof state !== 'object') return null;
  const feedback = state as {
    mealDuplicated?: boolean;
    mealUpdated?: boolean;
  };
  if (feedback.mealUpdated) return 'La comida se actualizó correctamente.';
  if (feedback.mealDuplicated) return 'La comida se repitió correctamente.';
  return null;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}
