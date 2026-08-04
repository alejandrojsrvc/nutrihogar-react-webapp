import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { AvailabilitySummary } from '../components/AvailabilitySummary';
import { PreparationProgress } from '../components/PreparationProgress';
import {
  usePreparedBatchDetails,
  useServePreparedBatchPortions,
} from '../hooks/usePreparedBatches';
import '../recipes.css';

export function ServePreparedBatchPortionsPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const details = usePreparedBatchDetails(batchId);
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const serve = useServePreparedBatchPortions();
  const [rows, setRows] = useState<
    Array<{ adultProfileId: string; servedWeight: string }>
  >([{ adultProfileId: '', servedWeight: '' }]);

  if (!batchId)
    return (
      <p className="page-section" role="alert">
        Falta identificar la preparación. Abre esta acción desde su detalle.
      </p>
    );
  if (details.isPending || households.isPending || profiles.isPending)
    return (
      <p className="page-section" role="status">
        Cargando porciones...
      </p>
    );
  if (
    details.isError ||
    !details.data ||
    households.isError ||
    !households.activeHousehold ||
    profiles.isError
  )
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la preparación o los integrantes del hogar.
      </p>
    );

  if (details.data.batch.status !== 'FINALIZED') {
    const cancelled = details.data.batch.status === 'CANCELLED';
    return (
      <section className="page-section preparation-page" role="alert">
        <BackButton fallback={`/app/preparaciones/${batchId}`} />
        {!cancelled ? (
          <>
            <PreparationProgress
              current={
                details.data.batch.status === 'DRAFT' ? 'ingredients' : 'weight'
              }
            />
            <Link
              className="button button--primary"
              to={`/app/preparaciones/${batchId}`}
            >
              Continuar preparación
            </Link>
          </>
        ) : null}
      </section>
    );
  }

  const availability = details.data.availability;
  const available = availability?.availableWeight ?? 0;
  const servingRows = rows.filter((row) => Number(row.servedWeight) > 0);
  const total = servingRows.reduce(
    (sum, row) => sum + Number(row.servedWeight),
    0,
  );
  const memberMissing = servingRows.some((row) => !row.adultProfileId);
  const invalidWeight = rows.some(
    (row) =>
      row.servedWeight !== '' &&
      (!Number.isFinite(Number(row.servedWeight)) ||
        Number(row.servedWeight) <= 0),
  );
  const invalid =
    !availability ||
    servingRows.length === 0 ||
    memberMissing ||
    invalidWeight ||
    total > available;
  const activeProfiles = profiles.profiles.filter(
    (profile) => profile.isActive !== false,
  );

  return (
    <section
      className="page-section preparation-page"
      aria-labelledby="serve-portions-title"
    >
      <BackButton fallback={`/app/preparaciones/${batchId}`} />
      <PreparationProgress current="portions" />
      <AvailabilitySummary availability={availability} pendingWeight={total} />

      {!activeProfiles.length ? (
        <p className="preparation-callout" role="alert">
          Este hogar no tiene integrantes activos. Se necesita un integrante
          para registrar una porción.
        </p>
      ) : null}

      <form
        className="portion-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (invalid || serve.isPending) return;
          serve.mutate(
            {
              batchId,
              input: {
                portions: servingRows.map((row) => ({
                  adultProfileId: row.adultProfileId,
                  servedWeight: Number(row.servedWeight),
                })),
              },
            },
            {
              onSuccess: (result) =>
                navigate(`/app/preparaciones/${batchId}`, {
                  replace: true,
                  state: {
                    successMessage: `${result.portions.length} ${
                      result.portions.length === 1
                        ? 'porción guardada'
                        : 'porciones guardadas'
                    }. Quedan ${result.availableWeight} g disponibles.`,
                  },
                }),
            },
          );
        }}
      >
        <fieldset className="preparation-fieldset">
          <legend>Porciones por integrante</legend>
          {rows.map((row, index) => (
            <div className="portion-row" key={index}>
              <div className="form-field">
                <label htmlFor={`portion-profile-${index}`}>Integrante</label>
                <select
                  id={`portion-profile-${index}`}
                  onChange={(event) =>
                    setRows((current) =>
                      current.map((item, position) =>
                        position === index
                          ? { ...item, adultProfileId: event.target.value }
                          : item,
                      ),
                    )
                  }
                  required={Number(row.servedWeight) > 0}
                  value={row.adultProfileId}
                >
                  <option value="">Selecciona un integrante</option>
                  {activeProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor={`portion-weight-${index}`}>
                  Peso servido (g)
                </label>
                <input
                  aria-describedby={
                    row.servedWeight !== '' && Number(row.servedWeight) <= 0
                      ? `portion-weight-error-${index}`
                      : undefined
                  }
                  aria-invalid={
                    row.servedWeight !== '' && Number(row.servedWeight) <= 0
                  }
                  id={`portion-weight-${index}`}
                  inputMode="decimal"
                  min="0.000001"
                  onChange={(event) =>
                    setRows((current) =>
                      current.map((item, position) =>
                        position === index
                          ? { ...item, servedWeight: event.target.value }
                          : item,
                      ),
                    )
                  }
                  step="any"
                  type="number"
                  value={row.servedWeight}
                />
                {row.servedWeight !== '' && Number(row.servedWeight) <= 0 ? (
                  <p
                    className="form-field__error"
                    id={`portion-weight-error-${index}`}
                  >
                    Indica un peso mayor que cero.
                  </p>
                ) : null}
              </div>
              {rows.length > 1 ? (
                <div className="recipe-row-actions">
                  <button
                    className="button button--text"
                    onClick={() =>
                      setRows((current) =>
                        current.filter((_, position) => position !== index),
                      )
                    }
                    type="button"
                  >
                    <Trash2 size={16} aria-hidden="true" /> Quitar
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          <div className="recipe-inline-actions">
            <button
              className="button button--secondary"
              onClick={() =>
                setRows((current) => [
                  ...current,
                  { adultProfileId: '', servedWeight: '' },
                ])
              }
              type="button"
            >
              Agregar otra porción
            </button>
          </div>
        </fieldset>

        {memberMissing ? (
          <p className="form-field__error" role="alert">
            Selecciona un integrante para cada porción con peso.
          </p>
        ) : null}
        {total > available ? (
          <p className="form-field__error" role="alert">
            El total supera los {available} g disponibles.
          </p>
        ) : null}
        {serve.isError ? (
          <p role="alert">
            No se pudo servir. La disponibilidad pudo cambiar; tus cantidades
            siguen aquí para que puedas revisarlas.
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
            disabled={invalid || serve.isPending || !activeProfiles.length}
            type="submit"
          >
            {serve.isPending ? 'Guardando...' : 'Guardar porciones'}
          </button>
        </div>
      </form>
    </section>
  );
}
