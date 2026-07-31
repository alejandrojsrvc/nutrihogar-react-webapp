import { Link, useParams } from 'react-router';
import { formatCalories, formatGrams } from '@nutrihogar/domain';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useMealDetails } from '../hooks/useMeals';


export function MealDetailPage() {
  const { mealId } = useParams();
  const query = useMealDetails(mealId);

  if (query.isPending) return <p className="page-section" role="status">Cargando detalle...</p>;
  if (query.isError || !query.data) return <p className="page-section" role="alert">No se pudo cargar el detalle de la comida.</p>;

  const meal = query.data;
  return <section className="page-section meal-detail-page" aria-labelledby="meal-detail-title"><BackButton fallback="/app" /><PageHeader eyebrow="Registro de comida" title={mealTypeLabels[meal.mealType] ?? meal.mealType} titleId="meal-detail-title" /><p className="supporting-text">{formatDateTime(meal.consumedAt)}</p><section className="meal-detail-summary" aria-labelledby="meal-detail-summary-title"><p className="eyebrow">Resumen confirmado</p><h2 id="meal-detail-summary-title">Nutrientes de la comida</h2><dl className="nutrition-value-list"><div><dt>Calorías</dt><dd>{formatCalories(meal.totals.calories)}</dd></div><div><dt>Proteína</dt><dd>{formatGrams(meal.totals.proteinGrams)}</dd></div><div><dt>Carbohidratos</dt><dd>{formatGrams(meal.totals.carbohydrateGrams)}</dd></div><div><dt>Grasas</dt><dd>{formatGrams(meal.totals.fatGrams)}</dd></div><div><dt>Fibra</dt><dd>{formatGrams(meal.totals.fiberGrams)}</dd></div></dl></section><section className="meal-detail-items" aria-labelledby="meal-detail-items-title"><h2 id="meal-detail-items-title">Alimentos</h2>{meal.items.length === 0 ? <p>No hay alimentos disponibles para este registro.</p> : <ul>{meal.items.map((item, index) => <li key={`${item.foodId}-${index}`}><strong>{item.foodName}</strong><span>{item.quantity} {item.unit.toLowerCase()}</span></li>)}</ul>}</section>{meal.notes ? <p className="meal-detail-notes"><strong>Nota:</strong> {meal.notes}</p> : null}<Link className="button button--secondary" to="/app">Volver al inicio</Link></section>;
}

const mealTypeLabels: Record<string, string> = { BREAKFAST: 'Desayuno', DINNER: 'Cena', EXTRA: 'Extra', LUNCH: 'Almuerzo', SNACK: 'Merienda' };
function formatDateTime(value: string) { return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)); }
