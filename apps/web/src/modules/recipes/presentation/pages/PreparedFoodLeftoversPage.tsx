import { Link } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { usePreparedFoodLeftovers } from '../hooks/usePreparedFoodLeftovers';

export function PreparedFoodLeftoversPage() {
  const households = useHouseholds();
  const leftovers = usePreparedFoodLeftovers(households.activeHousehold?.id);
  if (households.isPending || leftovers.isPending)
    return (
      <p className="page-section" role="status">
        Cargando sobrantes...
      </p>
    );
  if (households.isError || leftovers.isError)
    return (
      <p className="page-section" role="alert">
        No se pudieron cargar los sobrantes.
      </p>
    );
  if (!households.activeHousehold)
    return (
      <p className="page-section" role="alert">
        Selecciona un hogar para ver los sobrantes.
      </p>
    );

  return (
    <section className="page-section" aria-labelledby="leftovers-title">
      <BackButton fallback="/app" />
      <PageHeader
        eyebrow={households.activeHousehold.name}
        title="Sobrantes disponibles"
        titleId="leftovers-title"
        description="Preparaciones guardadas para consumir después."
      />
      {leftovers.data?.length ? (
        <div className="recipe-list">
          {leftovers.data.map((leftover) => (
            <article className="recipe-card" key={leftover.id}>
              <div>
                <h2>{leftover.availableWeight} g disponibles</h2>
                <p>
                  {leftover.storageLocation ?? 'Ubicación no indicada'} ·{' '}
                  {formatDate(leftover.storedAt)}
                </p>
                <span className="status-badge">{leftover.status}</span>
              </div>
              <Link
                className="button button--secondary"
                to={`/app/sobrantes/${leftover.id}`}
              >
                Ver sobrante
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay sobrantes"
          description="Los sobrantes guardados de tus preparaciones aparecerán aquí."
        />
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}
