import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAddPreparedFoodLeftoverToInventory, usePreparedFoodLeftover, useUpdatePreparedFoodLeftoverStatus } from '../hooks/usePreparedFoodLeftovers';

export function PreparedFoodLeftoverDetailPage() {
  const { leftoverId = '' } = useParams();
  const navigate = useNavigate();
  const leftover = usePreparedFoodLeftover(leftoverId);
  const updateStatus = useUpdatePreparedFoodLeftoverStatus();
  const addToInventory = useAddPreparedFoodLeftoverToInventory();
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  if (leftover.isPending) return <p className="page-section" role="status">Cargando sobrante...</p>;
  if (leftover.isError || !leftover.data) return <p className="page-section" role="alert">No se pudo cargar el sobrante.</p>;

  const value = leftover.data;
  const available = value.status === 'AVAILABLE';
  const selectedQuantity = quantity === '' ? value.availableWeight : Number(quantity);
  const invalidQuantity = !Number.isFinite(selectedQuantity) || selectedQuantity <= 0 || selectedQuantity > value.availableWeight;

  function addInventory() {
    if (invalidQuantity || !window.confirm('Se agregará esta cantidad al inventario con su trazabilidad. ¿Quieres continuar?')) return;
    addToInventory.mutate({ leftoverId, input: { expiresAt: expiresAt ? new Date(expiresAt) : null, location: location.trim() || null, quantity: selectedQuantity } }, { onSuccess: (item) => navigate(`/app/inventario/${item.id}`) });
  }

  return <section className="page-section" aria-labelledby="leftover-detail-title"><BackButton fallback="/app/sobrantes" /><PageHeader eyebrow="Sobrante de preparación" title={`${value.availableWeight} g disponibles`} titleId="leftover-detail-title" /><dl className="recipe-detail-meta"><div><dt>Estado</dt><dd>{value.status}</dd></div><div><dt>Guardado</dt><dd>{formatDate(value.storedAt)}</dd></div><div><dt>Ubicación actual</dt><dd>{value.storageLocation ?? 'No indicada'}</dd></div></dl><section className="recipe-detail-section"><h2>Densidad nutricional</h2><dl className="nutrition-value-list">{Object.entries(value.nutrientDensitySnapshot).map(([key, amount]) => <div key={key}><dt>{key}</dt><dd>{amount} por g</dd></div>)}</dl></section>{value.notes ? <p className="meal-detail-notes"><strong>Nota:</strong> {value.notes}</p> : null}{updateStatus.isError || addToInventory.isError ? <p role="alert">No se pudo actualizar el sobrante. Si ya fue agregado, esta operación no puede repetirse.</p> : null}{available ? <section className="recipe-detail-section" aria-labelledby="add-leftover-title"><h2 id="add-leftover-title">Agregar al inventario</h2><div className="form-field"><label htmlFor="leftover-quantity">Cantidad (g)</label><input id="leftover-quantity" inputMode="decimal" max={value.availableWeight} min="0.1" onChange={(event) => setQuantity(event.target.value)} step="0.1" type="number" value={quantity} /><p className="supporting-text">Disponible: {value.availableWeight} g</p></div><div className="form-field"><label htmlFor="leftover-location">Ubicación</label><input id="leftover-location" onChange={(event) => setLocation(event.target.value)} placeholder="Ej. Refrigerador" type="text" value={location} /></div><div className="form-field"><label htmlFor="leftover-expires-at">Vencimiento opcional</label><input id="leftover-expires-at" onChange={(event) => setExpiresAt(event.target.value)} type="datetime-local" value={expiresAt} /></div><div className="recipe-form__actions"><button className="button button--primary" disabled={addToInventory.isPending || invalidQuantity} onClick={addInventory} type="button">{addToInventory.isPending ? 'Agregando...' : 'Agregar al inventario'}</button><button className="button button--secondary" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ leftoverId, status: 'CONSUMED' }, { onSuccess: () => navigate('/app/sobrantes') })} type="button">Consumir sobrante</button><button className="button button--danger" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ leftoverId, status: 'DISCARDED' }, { onSuccess: () => navigate('/app/sobrantes') })} type="button">Descartar sobrante</button></div></section> : null}<Link className="button button--secondary" to={`/app/preparaciones/${value.preparedBatchId}`}>Ver preparación original</Link></section>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
