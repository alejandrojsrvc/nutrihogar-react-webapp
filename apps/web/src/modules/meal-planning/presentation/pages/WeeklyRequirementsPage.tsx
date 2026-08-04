import { Link, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useWeeklyRequirements } from '../hooks/useMealPlanning';
import { RelatedActions } from '../components/RelatedActions';

export function WeeklyRequirementsPage() {
  const { weeklyPlanId } = useParams();
  const query = useWeeklyRequirements(weeklyPlanId);
  if (query.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando requerimientos..." />
      </section>
    );
  if (query.isError)
    return (
      <section className="page-section">
        <ErrorState
          message="No se pudieron cargar los requerimientos."
          action={
            <button
              className="button button--secondary"
              onClick={() => void query.refetch()}
              type="button"
            >
              Reintentar
            </button>
          }
        />
      </section>
    );
  const groups = groupByUnit(query.data?.items ?? []);
  return (
    <section
      className="page-section meal-planning-detail"
      aria-labelledby="requirements-title"
    >
      <BackButton fallback="/app/plan-semanal" />
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
        <EmptyState
          title="No hay requerimientos"
          description="Cuando el plan tenga cantidades confirmadas aparecerán aquí."
        />
      )}
      <RelatedActions>
        <Link
          to={`/app/plan-semanal/${weeklyPlanId}/comparacion-inventario`}
        >
          Comparar con inventario
        </Link>
        <Link to={`/app/plan-semanal/${weeklyPlanId}/adherencia`}>
          Ver adherencia
        </Link>
      </RelatedActions>
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
