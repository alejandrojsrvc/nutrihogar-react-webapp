import { Link } from 'react-router';

import { Badge } from '../../../../shared/presentation/components/Badge';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { usePreparedFoodLeftovers } from '../hooks/usePreparedFoodLeftovers';
import {
  formatDateTime,
  formatQuantity,
  humanizeEnum,
  statusTone,
} from '../recipePresentation';
import '../recipes.css';

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
    <section
      className="page-section leftover-page"
      aria-labelledby="leftovers-title"
    >
      {leftovers.data?.length ? (
        <ul className="recipe-list" aria-label="Sobrantes guardados">
          {leftovers.data.map((leftover) => (
            <li className="recipe-list-row" key={leftover.id}>
              <Link
                className="recipe-list-row__link"
                to={`/app/sobrantes/${leftover.id}`}
              >
                <div className="recipe-list-row__heading">
                  <h2>{formatQuantity(leftover.availableWeight, 'GRAM')}</h2>
                  <Badge tone={statusTone(leftover.status)}>
                    {humanizeEnum(leftover.status)}
                  </Badge>
                </div>
                <p className="supporting-text">
                  {leftover.storageLocation
                    ? humanizeEnum(leftover.storageLocation)
                    : 'Ubicación no indicada'}{' '}
                  · {formatDateTime(leftover.storedAt)}
                </p>
                <small>
                  El nombre de la preparación no está incluido en este listado.
                </small>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No hay sobrantes"
          description="Los sobrantes guardados de tus preparaciones aparecerán aquí."
        />
      )}
    </section>
  );
}
