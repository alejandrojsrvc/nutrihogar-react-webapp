import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { AvailabilitySummary } from '../components/AvailabilitySummary';
import { PreparationProgress } from '../components/PreparationProgress';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';
import { useCreatePreparedFoodLeftover } from '../hooks/usePreparedFoodLeftovers';
import '../recipes.css';

export function CreatePreparedFoodLeftoverPage() {
  const { batchId = '' } = useParams();
  const navigate = useNavigate();
  const details = usePreparedBatchDetails(batchId);
  const create = useCreatePreparedFoodLeftover();
  const [weight, setWeight] = useState('');
  const [storedAt, setStoredAt] = useState(toDateTimeLocal(new Date()));
  const [storageLocation, setStorageLocation] = useState('REFRIGERATOR');
  const [notes, setNotes] = useState('');

  if (!batchId)
    return (
      <p className="page-section" role="alert">
        Falta identificar la preparación. Abre esta acción desde su detalle.
      </p>
    );
  if (details.isPending)
    return (
      <p className="page-section" role="status">
        Cargando disponibilidad...
      </p>
    );
  if (details.isError || !details.data)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la preparación.
      </p>
    );

  if (details.data.batch.status !== 'FINALIZED') {
    const cancelled = details.data.batch.status === 'CANCELLED';
    return (
      <section className="page-section leftover-page" role="alert">
        <BackButton fallback={`/app/preparaciones/${batchId}`} />
        {!cancelled ? (
          <PreparationProgress
            current={
              details.data.batch.status === 'DRAFT' ? 'ingredients' : 'weight'
            }
          />
        ) : null}
        {!cancelled ? (
          <Link
            className="button button--primary"
            to={`/app/preparaciones/${batchId}`}
          >
            Continuar preparación
          </Link>
        ) : null}
      </section>
    );
  }

  const availability = details.data.availability;
  const availableWeight = availability?.availableWeight ?? 0;
  const requestedWeight = Number(weight);
  const invalid =
    !Number.isFinite(requestedWeight) ||
    requestedWeight <= 0 ||
    requestedWeight > availableWeight;

  function submit() {
    if (invalid) return;
    create.mutate(
      {
        batchId,
        input: {
          notes: notes.trim() || undefined,
          storageLocation: storageLocation.trim() || undefined,
          storedAt: new Date(storedAt),
          weight: requestedWeight,
        },
      },
      {
        onSuccess: () =>
          navigate(`/app/preparaciones/${batchId}`, {
            replace: true,
            state: { successMessage: 'El sobrante quedó guardado.' },
          }),
      },
    );
  }

  return (
    <section
      className="page-section leftover-page"
      aria-labelledby="create-leftover-title"
    >
      <BackButton fallback={`/app/preparaciones/${batchId}`} />
      <PreparationProgress current="leftover" />
      <AvailabilitySummary
        availability={availability}
        pendingWeight={invalid ? 0 : requestedWeight}
      />
      <form
        className="leftover-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <fieldset className="preparation-fieldset">
          <legend>Cantidad y guardado</legend>
          <div className="form-field">
            <label htmlFor="leftover-weight">Peso del sobrante (g)</label>
            <input
              id="leftover-weight"
              min="0.1"
              onChange={(event) => setWeight(event.target.value)}
              step="0.1"
              type="number"
              value={weight}
            />
            {invalid && weight ? (
              <p className="form-field__error">
                Indica un peso mayor que cero y no mayor a la disponibilidad.
              </p>
            ) : null}
          </div>
          <div className="form-field">
            <label htmlFor="leftover-stored-at">Fecha y hora</label>
            <input
              id="leftover-stored-at"
              onChange={(event) => setStoredAt(event.target.value)}
              required
              type="datetime-local"
              value={storedAt}
            />
          </div>
          <div className="form-field">
            <label htmlFor="leftover-location">Ubicación</label>
            <select
              id="leftover-location"
              onChange={(event) => setStorageLocation(event.target.value)}
              value={storageLocation}
            >
              <option value="REFRIGERATOR">Refrigerador</option>
              <option value="FREEZER">Congelador</option>
              <option value="PANTRY">Despensa</option>
            </select>
          </div>
        </fieldset>
        <fieldset className="preparation-fieldset">
          <legend>Nota opcional</legend>
          <div className="form-field">
            <label htmlFor="leftover-notes">Nota (opcional)</label>
            <textarea
              id="leftover-notes"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </div>
        </fieldset>
        <p className="supporting-text">
          El sobrante conserva la densidad nutricional definitiva de la
          preparación.
        </p>
        {create.isError ? (
          <p role="alert">
            No se pudo guardar el sobrante. Inténtalo nuevamente.
          </p>
        ) : null}
        <div className="recipe-page-actions">
          <Link
            className="button button--secondary"
            to={`/app/preparaciones/${batchId}`}
          >
            Cancelar
          </Link>
          <button
            className="button button--primary"
            disabled={invalid || create.isPending}
            type="submit"
          >
            {create.isPending ? 'Guardando...' : 'Guardar sobrante'}
          </button>
        </div>
      </form>
    </section>
  );
}

function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
