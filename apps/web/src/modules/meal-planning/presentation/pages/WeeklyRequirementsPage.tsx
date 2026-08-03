import { Link, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useWeeklyRequirements } from '../hooks/useMealPlanning';

export function WeeklyRequirementsPage() {
  const { weeklyPlanId } = useParams();
  const query = useWeeklyRequirements(weeklyPlanId);
  if (query.isPending)
    return (
      <p className="page-section" role="status">
        Cargando requerimientos...
      </p>
    );
  if (query.isError)
    return (
      <section className="page-section" role="alert">
        <p>No se pudieron cargar los requerimientos.</p>
        <button
          className="button button--secondary"
          onClick={() => void query.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  const groups = groupByUnit(query.data?.items ?? []);
  return (
    <section
      className="page-section meal-planning-detail"
      aria-labelledby="requirements-title"
    >
      <BackButton fallback="/app/plan-semanal" />
      <PageHeader
        eyebrow="Plan semanal"
        title="Ingredientes requeridos"
        titleId="requirements-title"
        description="El agregado semanal agrupado por unidad de medida."
      />
      <Link
        className="button button--secondary"
        to={`/app/plan-semanal/${weeklyPlanId}/comparacion-inventario`}
      >
        Comparar con inventario
      </Link>
      {query.data?.warnings.map((warning) => (
        <p className="notice" key={warning}>
          {warning}
        </p>
      ))}
      {Object.keys(groups).length ? (
        Object.entries(groups).map(([unit, items]) => (
          <section className="requirements-group" key={unit}>
            <h2>{unit}</h2>
            <ul>
              {items.map((item) => (
                <li key={`${item.foodId}-${item.unit}`}>
                  <span>{item.name}</span>
                  <strong>
                    {item.required} {item.unit}
                  </strong>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <div className="empty-state">
          <h2>No hay requerimientos</h2>
          <p>Cuando el plan tenga cantidades confirmadas aparecerán aquí.</p>
        </div>
      )}
    </section>
  );
}
function groupByUnit(
  items: Array<{
    foodId: string;
    name: string;
    unit: string;
    required: number;
  }>,
) {
  return items.reduce<Record<string, typeof items>>((groups, item) => {
    (groups[item.unit] ??= []).push(item);
    return groups;
  }, {});
}
