import { Link, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';

export function PreparedBatchDetailPage() {
  const { batchId } = useParams();
  const details = usePreparedBatchDetails(batchId);

  if (details.isPending) return <p className="page-section" role="status">Cargando preparación...</p>;
  if (details.isError || !details.data) return <p className="page-section" role="alert">No se pudo cargar el detalle de la preparación.</p>;

  const { batch, availability, servedPortions, leftovers } = details.data;
  const available = (availability?.availableWeight ?? 0) > 0;

  return (
    <section className="page-section" aria-labelledby="prepared-batch-title">
      <BackButton fallback={batch.recipeId ? `/app/recetas/${batch.recipeId}` : '/app'} />
      <PageHeader eyebrow="Preparación familiar" title={batch.recipeNameSnapshot} titleId="prepared-batch-title" />
      <p className="status-badge">{batch.status}</p>
      <dl className="recipe-detail-meta">
        <div><dt>Peso cocido</dt><dd>{batch.finalCookedWeight ?? 'Pendiente'}{batch.finalCookedWeight ? ' g' : ''}</dd></div>
        <div><dt>Servido</dt><dd>{availability?.servedWeight ?? 'No disponible'} g</dd></div>
        <div><dt>Disponible</dt><dd>{availability?.availableWeight ?? 'No disponible'} g</dd></div>
      </dl>
      <section className="recipe-detail-section"><h2>Ingredientes reales</h2><ul>{batch.ingredients.map((ingredient) => <li key={ingredient.id}>{ingredient.foodNameSnapshot ?? ingredient.foodId}: {ingredient.quantity} {ingredient.unit.toLowerCase()}</li>)}</ul></section>
      <section className="recipe-detail-section"><h2>Porciones registradas</h2>{servedPortions.length ? <ul>{servedPortions.map((portion) => <li key={portion.id}><span>{portion.adultProfileId}: {portion.servedWeight} g · {portion.status}</span>{portion.consumedWeight == null ? <Link className="button button--secondary" to={`/app/porciones/${portion.id}/confirmar?batchId=${batch.id}`}>Confirmar consumo</Link> : <small>{portion.consumedWeight} g consumidos</small>}</li>)}</ul> : <p>Aún no hay porciones.</p>}</section>
      <section className="recipe-detail-section"><h2>Sobrantes</h2>{leftovers.length ? <ul>{leftovers.map((leftover) => <li key={leftover.id}><Link to={`/app/sobrantes/${leftover.id}`}>{leftover.availableWeight} g · {leftover.status}</Link></li>)}</ul> : <p>Aún no hay sobrantes.</p>}{available ? <Link className="button button--secondary" to={`/app/preparaciones/${batch.id}/sobrante`}>Guardar sobrante</Link> : null}</section>
      {batch.status === 'FINALIZED' ? <Link className="button button--primary" to={`/app/preparaciones/${batch.id}/servir`}>Servir porciones</Link> : null}
    </section>
  );
}
