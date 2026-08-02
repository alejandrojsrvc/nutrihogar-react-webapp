import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { usePreparedFoodLeftover, useUpdatePreparedFoodLeftoverStatus } from '../hooks/usePreparedFoodLeftovers';

export function PreparedFoodLeftoverDetailPage() {
  const { leftoverId = '' } = useParams();
  const navigate = useNavigate();
  const leftover = usePreparedFoodLeftover(leftoverId);
  const updateStatus = useUpdatePreparedFoodLeftoverStatus();
  if (leftover.isPending) return <p className="page-section" role="status">Cargando sobrante...</p>;
  if (leftover.isError || !leftover.data) return <p className="page-section" role="alert">No se pudo cargar el sobrante.</p>;
  const value = leftover.data;
  const available = value.status === 'AVAILABLE';
  return <section className="page-section" aria-labelledby="leftover-detail-title"><BackButton fallback="/app/sobrantes" /><PageHeader eyebrow="Sobrante de preparación" title={`${value.availableWeight} g disponibles`} titleId="leftover-detail-title" /><dl className="recipe-detail-meta"><div><dt>Estado</dt><dd>{value.status}</dd></div><div><dt>Guardado</dt><dd>{formatDate(value.storedAt)}</dd></div><div><dt>Ubicación</dt><dd>{value.storageLocation ?? 'No indicada'}</dd></div></dl><section className="recipe-detail-section"><h2>Densidad nutricional</h2><dl className="nutrition-value-list">{Object.entries(value.nutrientDensitySnapshot).map(([key, amount]) => <div key={key}><dt>{key}</dt><dd>{amount} por g</dd></div>)}</dl></section>{value.notes ? <p className="meal-detail-notes"><strong>Nota:</strong> {value.notes}</p> : null}{updateStatus.isError ? <p role="alert">No se pudo actualizar el estado del sobrante.</p> : null}{available ? <div className="recipe-form__actions"><button className="button button--secondary" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ leftoverId, status: 'CONSUMED' }, { onSuccess: () => navigate('/app/sobrantes') })} type="button">Consumir sobrante</button><button className="button button--danger" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ leftoverId, status: 'DISCARDED' }, { onSuccess: () => navigate('/app/sobrantes') })} type="button">Descartar sobrante</button></div> : null}<Link className="button button--secondary" to={`/app/preparaciones/${value.preparedBatchId}`}>Ver preparación original</Link></section>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
