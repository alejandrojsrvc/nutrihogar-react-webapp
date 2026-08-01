import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';
import { useCreatePreparedFoodLeftover } from '../hooks/usePreparedFoodLeftovers';

export function CreatePreparedFoodLeftoverPage() {
  const { batchId = '' } = useParams();
  const navigate = useNavigate();
  const details = usePreparedBatchDetails(batchId);
  const create = useCreatePreparedFoodLeftover();
  const [weight, setWeight] = useState('');
  const [storedAt, setStoredAt] = useState(toDateTimeLocal(new Date()));
  const [storageLocation, setStorageLocation] = useState('REFRIGERATOR');
  const [notes, setNotes] = useState('');

  if (details.isPending) return <p className="page-section" role="status">Cargando disponibilidad...</p>;
  if (details.isError || !details.data) return <p className="page-section" role="alert">No se pudo cargar la preparación.</p>;

  const availableWeight = details.data.availability?.availableWeight ?? 0;
  const requestedWeight = Number(weight);
  const invalid = !Number.isFinite(requestedWeight) || requestedWeight <= 0 || requestedWeight > availableWeight;

  function submit() {
    if (invalid) return;
    create.mutate({ batchId, input: { notes: notes.trim() || undefined, storageLocation: storageLocation.trim() || undefined, storedAt: new Date(storedAt), weight: requestedWeight } }, { onSuccess: () => navigate(`/app/preparaciones/${batchId}`) });
  }

  return <section className="page-section" aria-labelledby="create-leftover-title"><BackButton fallback={`/app/preparaciones/${batchId}`} /><PageHeader eyebrow="Preparación familiar" title="Guardar sobrante" titleId="create-leftover-title" description={`Disponible: ${availableWeight} g`} /><div className="form-field"><label htmlFor="leftover-weight">Peso del sobrante (g)</label><input id="leftover-weight" min="0.1" onChange={(event) => setWeight(event.target.value)} step="0.1" type="number" value={weight} />{invalid && weight ? <p className="form-field__error">Indica un peso mayor que cero y no mayor a la disponibilidad.</p> : null}</div><div className="form-field"><label htmlFor="leftover-stored-at">Fecha y hora</label><input id="leftover-stored-at" onChange={(event) => setStoredAt(event.target.value)} type="datetime-local" value={storedAt} /></div><div className="form-field"><label htmlFor="leftover-location">Ubicación</label><input id="leftover-location" onChange={(event) => setStorageLocation(event.target.value)} value={storageLocation} /></div><div className="form-field"><label htmlFor="leftover-notes">Nota (opcional)</label><textarea id="leftover-notes" onChange={(event) => setNotes(event.target.value)} value={notes} /></div><p className="supporting-text">El sobrante conserva la densidad nutricional de la preparación. La integración con inventario llegará después.</p>{create.isError ? <p role="alert">No se pudo guardar el sobrante. Inténtalo nuevamente.</p> : null}<div className="recipe-form__actions"><Link className="button button--secondary" to={`/app/preparaciones/${batchId}`}>Cancelar</Link><button className="button button--primary" disabled={invalid || create.isPending} onClick={submit} type="button">{create.isPending ? 'Guardando...' : 'Guardar sobrante'}</button></div></section>;
}

function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
