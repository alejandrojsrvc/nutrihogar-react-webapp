import { Link, useParams } from 'react-router';
import { formatCalories, formatGrams } from '@nutrihogar/domain';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useMealDetails } from '../hooks/useMeals';

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: 'Desayuno',
  DINNER: 'Cena',
  EXTRA: 'Extra',
  LUNCH: 'Almuerzo',
  SNACK: 'Merienda',
};

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
  const query = useMealDetails(mealId);

  if (query.isPending) return <p className="page-section" role="status">Cargando detalle...</p>;
  if (query.isError || !query.data) {
    return (
      <section className="page-section" role="alert">
        <p>No se pudo cargar el detalle de la comida.</p>
        <button className="button button--secondary" onClick={() => void query.refetch()} type="button">
          Reintentar
        </button>
      </section>
    );
  }

  const meal = query.data;
  return (
    <section className="page-section meal-detail-page" aria-labelledby="meal-detail-title">
      <BackButton fallback="/app" />
      <PageHeader
        eyebrow="Registro de comida"
        title={mealTypeLabels[meal.mealType] ?? meal.mealType}
        titleId="meal-detail-title"
      />
      <p className="supporting-text">{formatDateTime(meal.consumedAt)}</p>
      {meal.status !== 'CONFIRMED' ? (
        <p className="status-badge" role="status">{statusLabels[meal.status] ?? meal.status}</p>
      ) : null}
      <dl className="meal-detail-meta">
        <div><dt>Integrante</dt><dd>{meal.adultProfileId ?? 'No disponible'}</dd></div>
        <div><dt>Origen</dt><dd>{meal.source === 'MANUAL' ? 'Registro manual' : meal.source}</dd></div>
      </dl>
      <section className="meal-detail-summary" aria-labelledby="meal-detail-summary-title">
        <p className="eyebrow">Resumen confirmado</p>
        <h2 id="meal-detail-summary-title">Nutrientes de la comida</h2>
        <dl className="nutrition-value-list">
          <div><dt>Calorías</dt><dd>{formatCalories(meal.totals.calories)}</dd></div>
          <div><dt>Proteína</dt><dd>{formatGrams(meal.totals.proteinGrams)}</dd></div>
          <div><dt>Carbohidratos</dt><dd>{formatGrams(meal.totals.carbohydrateGrams)}</dd></div>
          <div><dt>Grasas</dt><dd>{formatGrams(meal.totals.fatGrams)}</dd></div>
          <div><dt>Fibra</dt><dd>{formatGrams(meal.totals.fiberGrams)}</dd></div>
        </dl>
      </section>
      <section className="meal-detail-items" aria-labelledby="meal-detail-items-title">
        <h2 id="meal-detail-items-title">Alimentos</h2>
        {meal.items.length === 0 ? <p>No hay alimentos disponibles para este registro.</p> : (
          <ul>
            {meal.items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.foodName}</strong>
                  <span>{item.quantity} {unitLabels[item.unit] ?? item.unit.toLowerCase()}</span>
                  <small>{methodLabels[item.measurementMethod] ?? 'Medición aproximada'}{item.preparationState ? ` · ${item.preparationState}` : ''}</small>
                </div>
                <dl className="meal-detail-item-nutrients">
                  {item.nutrients.map((nutrient) => (
                    <div key={`${item.id}-${nutrient.code}`}>
                      <dt>{nutrient.name}</dt>
                      <dd>{nutrient.amount} {nutrient.unit}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
      {meal.notes ? <p className="meal-detail-notes"><strong>Nota:</strong> {meal.notes}</p> : null}
      <div className="meal-detail-actions">
        <Link className="button button--primary" to={`/app/comidas/${meal.id}/editar`}>Editar comida</Link>
        <Link className="button button--secondary" to={`/app/comidas/${meal.id}/repetir`}>Repetir comida</Link>
        <button className="button button--danger" disabled={meal.status !== 'CONFIRMED'} type="button">Cancelar comida</button>
      </div>
    </section>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value));
}
