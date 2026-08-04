import type { PreparedBatchAvailability } from '../../domain/PreparedBatch';

export function AvailabilitySummary({
  availability,
  pendingWeight = 0,
}: {
  availability: PreparedBatchAvailability | null;
  pendingWeight?: number;
}) {
  if (!availability) {
    return (
      <section
        className="preparation-availability"
        aria-labelledby="availability-title"
      >
        <h2 id="availability-title">Disponibilidad</h2>
        <p className="supporting-text">
          La disponibilidad estará lista cuando la preparación tenga un peso
          final.
        </p>
      </section>
    );
  }

  const safePendingWeight = Math.max(0, pendingWeight);
  return (
    <section
      className="preparation-availability"
      aria-labelledby="availability-title"
    >
      <h2 id="availability-title">Disponibilidad</h2>
      <dl>
        <div>
          <dt>Peso cocido</dt>
          <dd>{formatWeight(availability.finalCookedWeight)}</dd>
        </div>
        <div>
          <dt>Servido</dt>
          <dd>{formatWeight(availability.servedWeight)}</dd>
        </div>
        <div>
          <dt>Guardado</dt>
          <dd>
            {formatWeight(
              availability.storedLeftoverWeight +
                availability.savedRemainderWeight,
            )}
          </dd>
        </div>
        <div>
          <dt>Descartado</dt>
          <dd>{formatWeight(availability.discardedWeight)}</dd>
        </div>
        {safePendingWeight > 0 ? (
          <div>
            <dt>En esta acción</dt>
            <dd>{formatWeight(safePendingWeight)}</dd>
          </div>
        ) : null}
        <div className="preparation-availability__available">
          <dt>{safePendingWeight > 0 ? 'Quedará disponible' : 'Disponible'}</dt>
          <dd>
            {formatWeight(
              Math.max(0, availability.availableWeight - safePendingWeight),
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function formatWeight(value: number) {
  return `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value)} g`;
}
