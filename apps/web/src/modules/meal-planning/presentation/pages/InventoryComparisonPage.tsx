import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import {
  useAddMissingShoppingItems,
  useInventoryComparison,
} from '../hooks/useMealPlanning';
import { RelatedActions } from '../components/RelatedActions';

const statusLabels = {
  COMPLETE: 'Completo',
  PARTIAL: 'Parcial',
  MISSING: 'Faltante',
  NOT_NEEDED: 'No necesario',
};
export function InventoryComparisonPage() {
  const { weeklyPlanId } = useParams();
  const query = useInventoryComparison(weeklyPlanId);
  const add = useAddMissingShoppingItems();
  const [selected, setSelected] = useState<string[]>([]);
  if (query.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando comparación..." />
      </section>
    );
  if (query.isError)
    return (
      <section className="page-section">
        <ErrorState
          message="No se pudo comparar el inventario."
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
  const items = query.data?.items ?? [];
  const missing = items.filter(
    (item) => item.status === 'MISSING' || item.status === 'PARTIAL',
  );
  const covered = items.filter(
    (item) => item.status === 'COMPLETE' || item.status === 'NOT_NEEDED',
  ).length;
  const submit = () => {
    if (!weeklyPlanId) return;
    const chosen = missing.filter((item) =>
      selected.includes(`${item.foodId}-${item.unit}`),
    );
    add.mutate({
      weeklyPlanId,
      items: chosen.map((item) => ({
        foodId: item.foodId,
        name: item.name,
        unit: item.unit,
        quantity: item.missing,
      })),
    });
  };
  return (
    <section
      className="page-section meal-planning-detail"
      aria-labelledby="comparison-title"
    >
      <BackButton
        fallback={`/app/plan-semanal/${weeklyPlanId}/requerimientos`}
      />
      <p className="coverage-summary">
        <strong>
          {covered}/{items.length}
        </strong>{' '}
        ingredientes cubiertos
      </p>
      {query.data?.warnings.map((warning) => (
        <p className="notice" key={warning}>
          {warning}
        </p>
      ))}
      {missing.length ? (
        <fieldset className="comparison-selection" disabled={add.isPending}>
          <legend>Faltantes para comprar</legend>
          {missing.map((item) => {
            const key = `${item.foodId}-${item.unit}`;
            return (
              <label key={key}>
                <input
                  checked={selected.includes(key)}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(key)
                        ? current.filter((value) => value !== key)
                        : [...current, key],
                    )
                  }
                  type="checkbox"
                />
                {item.name} · faltan {item.missing} {item.unit}
              </label>
            );
          })}
          <button
            className="button button--primary"
            disabled={!selected.length}
            onClick={submit}
            type="button"
          >
            {add.isPending ? 'Enviando...' : 'Agregar a lista de compras'}
          </button>
        </fieldset>
      ) : null}
      {add.isSuccess ? (
        <p role="status">
          Solicitud enviada. La lista de compras se actualizará con lo
          confirmado por el backend.
        </p>
      ) : null}
      {add.isError ? (
        <p role="alert">
          No se pudieron enviar los faltantes. Inténtalo nuevamente.
        </p>
      ) : null}
      {items.length ? (
        <ul className="comparison-list">
          {items.map((item) => (
            <li key={`${item.foodId}-${item.unit}`}>
              <div>
                <strong>{item.name}</strong>
                <span>
                  {item.unit} · Estado: {statusLabels[item.status]}
                </span>
              </div>
              <dl>
                <div>
                  <dt>Requerido</dt>
                  <dd>{item.required}</dd>
                </div>
                <div>
                  <dt>Disponible</dt>
                  <dd>{item.available}</dd>
                </div>
                <div>
                  <dt>Faltante</dt>
                  <dd>{item.missing}</dd>
                </div>
                <div>
                  <dt>Cobertura</dt>
                  <dd>{Math.round(item.coverage * 100)}%</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No hay comparación"
          description="Cuando existan requerimientos podrás ver su disponibilidad."
        />
      )}
      <RelatedActions>
        <Link to={`/app/plan-semanal/${weeklyPlanId}/requerimientos`}>
          Ver requerimientos
        </Link>
        <Link to={`/app/plan-semanal/${weeklyPlanId}/adherencia`}>
          Ver adherencia
        </Link>
      </RelatedActions>
    </section>
  );
}
