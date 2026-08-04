import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { Apple, Pencil, Trash2 } from 'lucide-react';

import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useDeleteCustomFood, useFoodDetail } from '../hooks/useFoodCatalog';
import '../food-catalog.css';
import {
  formatAmount,
  formatReference,
  formatServingUnit,
  getConfidenceLevelLabel,
  preparationStateLabels,
} from '../utils/foodLabels';

export function FoodDetailPage() {
  const { foodId } = useParams<{ foodId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const households = useHouseholds();
  const foodDetail = useFoodDetail(foodId);
  const deleteFood = useDeleteCustomFood();

  if (!foodId || foodDetail.isError) {
    return (
      <FoodDetailStatus
        isError
        message="No se pudo cargar el detalle del alimento."
        onRetry={foodId ? () => void foodDetail.refetch() : undefined}
      />
    );
  }

  if (foodDetail.isPending || !foodDetail.data) {
    return <FoodDetailStatus message="Cargando detalle del alimento..." />;
  }

  const food = foodDetail.data;
  const canManage =
    food.foodType === 'CUSTOM' &&
    !food.isGlobal &&
    food.householdId === households.activeHousehold?.id;
  const savedFeedback = getDetailFeedback(location.state);

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar ${food.name} de tu catálogo?`)) {
      return;
    }

    try {
      await deleteFood.mutateAsync(food.id);
      navigate('/app/alimentos', {
        replace: true,
        state: { foodDeleted: true },
      });
    } catch {
      // El error se muestra junto a las acciones del detalle.
    }
  }

  return (
    <section
      className="page-section food-detail-page"
      aria-labelledby="food-detail-title"
    >
      <BackButton fallback="/app/alimentos" label="Volver al catálogo" />
      <PageHeader
        action={
          canManage ? (
            <Link
              aria-label="Editar alimento"
              className="button button--secondary"
              to={`/app/alimentos/${food.id}/editar`}
            >
              <Pencil aria-hidden="true" size={18} />
              Editar
            </Link>
          ) : undefined
        }
        description={food.brand ?? `Valores por ${formatReference(food)}`}
        icon={<Apple size={25} />}
        title={food.name}
        titleId="food-detail-title"
      />
      {savedFeedback ? (
        <p className="food-feedback" role="status">
          {savedFeedback}
        </p>
      ) : null}
      <div className="food-detail-meta">
        <span>{food.category.name}</span>
        <span>{preparationStateLabels[food.preparationState]}</span>
        <span>Valores por {formatReference(food)}</span>
      </div>

      <section
        className="food-detail-section food-detail-section--summary"
        aria-labelledby="food-main-nutrients-title"
      >
        <h2 id="food-main-nutrients-title">Nutrientes principales</h2>
        <dl className="food-detail-highlights">
          <FoodNutrientHighlight
            label="Energía"
            unit="kcal"
            value={food.energyKcal}
          />
          <FoodNutrientHighlight
            label="Proteína"
            unit="g"
            value={food.proteinGrams}
          />
          <FoodNutrientHighlight
            label="Carbohidratos"
            unit="g"
            value={food.carbohydrateGrams}
          />
          <FoodNutrientHighlight label="Grasa" unit="g" value={food.fatGrams} />
        </dl>
      </section>

      <section
        className="food-detail-section"
        aria-labelledby="food-nutrients-title"
      >
        <h2 id="food-nutrients-title">Nutrientes completos</h2>
        {food.nutrients.length === 0 ? (
          <p className="empty-copy">
            Este alimento no tiene nutrientes adicionales.
          </p>
        ) : (
          <div className="food-table-wrapper">
            <table className="food-nutrients-table">
              <caption className="visually-hidden">
                Nutrientes completos del alimento
              </caption>
              <thead>
                <tr>
                  <th scope="col">Nutriente</th>
                  <th scope="col">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {food.nutrients.map((nutrient) => (
                  <tr key={nutrient.id}>
                    <th scope="row">{nutrient.nutrientDefinition.name}</th>
                    <td>
                      {formatAmount(nutrient.amount)}{' '}
                      {nutrient.nutrientDefinition.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        className="food-detail-section"
        aria-labelledby="food-servings-title"
      >
        <h2 id="food-servings-title">Porciones</h2>
        {food.servings.length === 0 ? (
          <p className="empty-copy">
            Este alimento no tiene porciones registradas.
          </p>
        ) : (
          <ul className="food-serving-list">
            {food.servings.map((serving) => (
              <li key={serving.id}>
                <strong>{serving.name}</strong>
                <span>
                  {formatAmount(serving.quantity)}{' '}
                  {formatServingUnit(serving.unit)}
                </span>
                {serving.equivalentGrams !== null ? (
                  <small>
                    {formatAmount(serving.equivalentGrams)} g equivalentes
                  </small>
                ) : null}
                {serving.equivalentMilliliters !== null ? (
                  <small>
                    {formatAmount(serving.equivalentMilliliters)} ml
                    equivalentes
                  </small>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="food-detail-section"
        aria-labelledby="food-source-title"
      >
        <h2 id="food-source-title">Fuente y confianza</h2>
        <dl className="food-source-list">
          <div>
            <dt>Fuente</dt>
            <dd>{food.source}</dd>
          </div>
          <div>
            <dt>Nivel de confianza</dt>
            <dd>{getConfidenceLevelLabel(food.confidenceLevel)}</dd>
          </div>
          {food.sourceReference ? (
            <div>
              <dt>Referencia</dt>
              <dd>{food.sourceReference}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {food.description ? (
        <section
          className="food-detail-section"
          aria-labelledby="food-description-title"
        >
          <h2 id="food-description-title">Descripción</h2>
          <p>{food.description}</p>
        </section>
      ) : null}

      {food.aliases.length > 0 ? (
        <section
          className="food-detail-section"
          aria-labelledby="food-aliases-title"
        >
          <h2 id="food-aliases-title">También conocido como</h2>
          <p>{food.aliases.join(', ')}</p>
        </section>
      ) : null}

      {canManage ? (
        <section
          className="food-danger-zone"
          aria-labelledby="food-delete-title"
        >
          <div>
            <h2 id="food-delete-title">Eliminar del catálogo</h2>
            <p>
              Dejará de estar disponible para nuevos registros. Las comidas ya
              registradas conservarán sus valores.
            </p>
          </div>
          <button
            className="button button--danger"
            disabled={deleteFood.isPending}
            onClick={() => void handleDelete()}
            type="button"
          >
            <Trash2 aria-hidden="true" size={18} />
            {deleteFood.isPending ? 'Eliminando...' : 'Eliminar alimento'}
          </button>
          {deleteFood.error ? (
            <p className="food-inline-error" role="alert">
              No se pudo eliminar el alimento. Inténtalo nuevamente.
            </p>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}

function getDetailFeedback(state: unknown): string | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  return (state as { foodSaved?: boolean }).foodSaved
    ? 'El alimento se guardó correctamente.'
    : null;
}

function FoodNutrientHighlight({
  label,
  unit,
  value,
}: {
  label: string;
  unit: string;
  value: number | null;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {formatAmount(value)} <small>{unit}</small>
      </dd>
    </div>
  );
}

function FoodDetailStatus({
  isError = false,
  message,
  onRetry,
}: {
  isError?: boolean;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section
      className="page-section"
      aria-labelledby="food-detail-status-title"
    >
      <PageHeader
        icon={<Apple size={25} />}
        title="Detalle del alimento"
        titleId="food-detail-status-title"
      />
      <p className="lead" role={isError ? 'alert' : 'status'}>
        {message}
      </p>
      {isError ? (
        <div className="food-status-actions">
          {onRetry ? (
            <button
              className="button button--primary"
              onClick={onRetry}
              type="button"
            >
              Reintentar
            </button>
          ) : null}
          <Link className="button button--secondary" to="/app/alimentos">
            Volver al catálogo
          </Link>
        </div>
      ) : null}
    </section>
  );
}
