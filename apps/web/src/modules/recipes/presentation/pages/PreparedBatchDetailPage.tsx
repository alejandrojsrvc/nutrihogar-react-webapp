import { Link, useLocation, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { AvailabilitySummary } from '../components/AvailabilitySummary';
import {
  PreparationProgress,
  type PreparationStep,
} from '../components/PreparationProgress';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';
import {
  formatDateTime,
  formatNutrientAmount,
  formatQuantity,
  humanizeEnum,
  statusTone,
} from '../recipePresentation';
import '../recipes.css';

export function PreparedBatchDetailPage() {
  const { batchId } = useParams();
  const location = useLocation();
  const details = usePreparedBatchDetails(batchId);
  const profiles = useAdultProfiles(details.data?.batch.householdId);
  const successMessage = (location.state as { successMessage?: string } | null)
    ?.successMessage;

  if (!batchId)
    return (
      <p className="page-section" role="alert">
        Falta identificar la preparación. Vuelve a la receta e inténtalo
        nuevamente.
      </p>
    );
  if (details.isPending)
    return (
      <p className="page-section" role="status">
        Cargando preparación...
      </p>
    );
  if (details.isError || !details.data)
    return (
      <section className="page-section" role="alert">
        <p>No se pudo cargar el detalle de la preparación.</p>
        <button
          className="button button--secondary"
          onClick={() => void details.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );

  const { batch, availability, servedPortions, leftovers } = details.data;
  const available = (availability?.availableWeight ?? 0) > 0;
  const currentStep: PreparationStep =
    batch.status === 'DRAFT'
      ? 'ingredients'
      : batch.status === 'INGREDIENTS_CONFIRMED'
        ? 'weight'
        : 'portions';

  return (
    <section
      className="page-section preparation-page"
      aria-labelledby="prepared-batch-title"
    >
      <BackButton
        fallback={batch.recipeId ? `/app/recetas/${batch.recipeId}` : '/app'}
      />
      {batch.status !== 'CANCELLED' ? (
        <PreparationProgress current={currentStep} />
      ) : null}
      {successMessage ? (
        <p className="preparation-callout" role="status">
          {successMessage}
        </p>
      ) : null}
      <div className="recipe-status-line">
        <Badge tone={statusTone(batch.status)}>
          {humanizeEnum(batch.status)}
        </Badge>
        {batch.status === 'CANCELLED' ? (
          <span className="supporting-text">
            Esta preparación se conserva como historial y no admite nuevas
            acciones.
          </span>
        ) : null}
      </div>

      <PreparationActions
        available={available}
        batchId={batch.id}
        recipeId={batch.recipeId}
        status={batch.status}
      />

      <AvailabilitySummary availability={availability} />

      <section className="recipe-detail-section">
        <h2>Ingredientes utilizados</h2>
        <ul className="recipe-detail-list">
          {batch.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              <strong>
                {ingredient.foodNameSnapshot ?? 'Alimento no disponible'}
              </strong>
              <span>
                {formatQuantity(ingredient.quantity, ingredient.unit)}
              </span>
              {ingredient.preparationStateSnapshot ? (
                <small>
                  {humanizeEnum(ingredient.preparationStateSnapshot)}
                </small>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {batch.status === 'FINALIZED' ? (
        <section className="recipe-detail-section">
          <h2>Nutrición definitiva</h2>
          <p className="supporting-text">
            Valores calculados por el servidor con el peso cocido registrado.
          </p>
          <dl className="nutrition-value-list">
            {Object.entries(batch.nutrientsPer100Grams).map(
              ([nutrient, amount]) => (
                <div key={nutrient}>
                  <dt>{humanizeEnum(nutrient)}</dt>
                  <dd>{formatNutrientAmount(amount, nutrient)} por 100 g</dd>
                </div>
              ),
            )}
          </dl>
        </section>
      ) : null}

      <section className="recipe-detail-section">
        <h2>Porciones registradas</h2>
        {servedPortions.length ? (
          <ul className="recipe-list">
            {servedPortions.map((portion) => {
              const profileName = profiles.profiles.find(
                (profile) => profile.id === portion.adultProfileId,
              )?.name;
              return (
                <li className="recipe-list-row" key={portion.id}>
                  <div className="recipe-list-row__content">
                    <div className="recipe-list-row__heading">
                      <h3>
                        {profileName ??
                          (profiles.isPending
                            ? 'Cargando integrante...'
                            : 'Integrante no disponible')}
                      </h3>
                      <Badge tone={statusTone(portion.status)}>
                        {portion.consumedWeight == null
                          ? humanizeEnum(portion.status)
                          : 'Consumo confirmado'}
                      </Badge>
                    </div>
                    <span>{formatQuantity(portion.servedWeight, 'GRAM')}</span>
                    <div className="recipe-row-actions">
                      {portion.consumedWeight == null ? (
                        <Link
                          className="button button--secondary"
                          to={`/app/porciones/${portion.id}/confirmar?batchId=${batch.id}`}
                        >
                          Confirmar consumo
                        </Link>
                      ) : (
                        <small>
                          {formatQuantity(portion.consumedWeight, 'GRAM')}{' '}
                          consumidos
                        </small>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Aún no se registraron porciones para integrantes del hogar.</p>
        )}
      </section>

      <section className="recipe-detail-section">
        <h2>Sobrantes guardados</h2>
        {leftovers.length ? (
          <ul className="recipe-list">
            {leftovers.map((leftover) => (
              <li className="recipe-list-row" key={leftover.id}>
                <Link
                  className="recipe-list-row__link"
                  to={`/app/sobrantes/${leftover.id}`}
                >
                  <div className="recipe-list-row__heading">
                    <h3>{formatQuantity(leftover.availableWeight, 'GRAM')}</h3>
                    <Badge tone={statusTone(leftover.status)}>
                      {humanizeEnum(leftover.status)}
                    </Badge>
                  </div>
                  <span className="supporting-text">
                    Guardado el {formatDateTime(leftover.storedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No hay sobrantes asociados a esta preparación. Solo aparecerán aquí
            después de guardarlos.
          </p>
        )}
      </section>
    </section>
  );
}

function PreparationActions({
  available,
  batchId,
  recipeId,
  status,
}: {
  available: boolean;
  batchId: string;
  recipeId: string | null;
  status: string;
}) {
  if (status === 'DRAFT') {
    return recipeId ? (
      <div className="recipe-page-actions">
        <Link
          className="button button--primary"
          to={`/app/preparaciones/nueva?recipeId=${recipeId}&batchId=${batchId}`}
        >
          Continuar con ingredientes
        </Link>
      </div>
    ) : (
      <p className="preparation-callout">
        No está disponible la receta original para continuar este borrador.
      </p>
    );
  }
  if (status === 'INGREDIENTS_CONFIRMED')
    return (
      <div className="recipe-page-actions">
        <Link
          className="button button--primary"
          to={`/app/preparaciones/${batchId}/finalizar`}
        >
          Registrar peso cocido
        </Link>
      </div>
    );
  if (status !== 'FINALIZED') return null;

  return (
    <div className="recipe-page-actions">
      {available ? (
        <Link
          className="button button--primary"
          to={`/app/preparaciones/${batchId}/servir`}
        >
          Servir porciones
        </Link>
      ) : null}
      <Link
        className="button button--secondary"
        to={`/app/preparaciones/${batchId}/inventario`}
      >
        Revisar ingredientes
      </Link>
      {available ? (
        <Link
          className="button button--secondary"
          to={`/app/preparaciones/${batchId}/sobrante`}
        >
          Guardar sobrante
        </Link>
      ) : null}
    </div>
  );
}
