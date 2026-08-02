import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import {
  useConfirmPreparedBatchInventory,
  usePreparedBatchInventoryPreview,
} from '../hooks/usePreparedBatchInventory';
import type { PreparedBatchInventoryDecision } from '../../domain/PreparedBatchInventory';

export function PreparedBatchInventoryPage() {
  const { batchId = '' } = useParams();
  const navigate = useNavigate();
  const preview = usePreparedBatchInventoryPreview(batchId);
  const confirm = useConfirmPreparedBatchInventory();
  const [decisions, setDecisions] = useState<Record<string, PreparedBatchInventoryDecision>>({});

  if (preview.isPending) return <p className="page-section" role="status">Revisando ingredientes...</p>;
  if (preview.isError || !preview.data) return <section className="page-section" role="alert"><p>No se pudo revisar el inventario de la preparación.</p><button className="button button--secondary" onClick={() => void preview.refetch()} type="button">Reintentar</button></section>;

  const value = preview.data;
  const decisionFor = (ingredientId: string) => decisions[ingredientId];
  const setDecision = (decision: PreparedBatchInventoryDecision) => setDecisions((current) => ({ ...current, [decision.ingredientId]: decision }));
  const allDecided = value.ingredients.every((ingredient) => Boolean(decisionFor(ingredient.ingredientId)) || ingredient.status === 'CONFIRMED');
  const selectedDecisions = value.ingredients.filter((ingredient) => ingredient.status !== 'CONFIRMED').map((ingredient) => decisionFor(ingredient.ingredientId)).filter((decision): decision is PreparedBatchInventoryDecision => Boolean(decision));

  function submit() {
    if (!allDecided || !batchId || value.alreadyConfirmed) return;
    confirm.mutate({ batchId, decisions: selectedDecisions }, { onSuccess: () => navigate(`/app/preparaciones/${batchId}`) });
  }

  return <section className="page-section" aria-labelledby="prepared-batch-inventory-title"><BackButton fallback={`/app/preparaciones/${batchId}`} /><PageHeader eyebrow="Confirmación de inventario" title="Ingredientes utilizados" titleId="prepared-batch-inventory-title" description="Confirma qué existencias se descontarán. La preparación no se bloquea si ignoras un ingrediente." />{value.alreadyConfirmed ? <p role="status">El consumo de ingredientes ya fue confirmado.</p> : null}<ul className="recipe-list">{value.ingredients.map((ingredient) => { const decision = decisionFor(ingredient.ingredientId); const unavailable = ingredient.status === 'NO_INVENTORY' || ingredient.status === 'INSUFFICIENT'; return <li className="recipe-card" key={ingredient.ingredientId}><div><h2>{ingredient.name}</h2><p>Utilizado: {ingredient.usedQuantity} {ingredient.unit} · Disponible: {ingredient.availableQuantity} {ingredient.unit}</p><p className="supporting-text">Estado: {statusLabel(decision?.action === 'IGNORE' ? 'IGNORED' : ingredient.status)}</p></div>{ingredient.options.length > 1 && decision?.action !== 'IGNORE' ? <label>Existencia<select aria-label={`Existencia para ${ingredient.name}`} onChange={(event) => setDecision({ action: 'CONSUME', ingredientId: ingredient.ingredientId, inventoryItemId: event.target.value })} value={decision?.inventoryItemId ?? ingredient.selectedInventoryItemId ?? ''}>{ingredient.options.map((option) => <option key={option.inventoryItemId} value={option.inventoryItemId}>{option.name} · {option.availableQuantity} {option.unit}{option.location ? ` · ${option.location}` : ''}</option>)}</select></label> : null}<div className="recipe-form__actions">{!value.alreadyConfirmed ? <><button className="button button--secondary" disabled={unavailable} onClick={() => setDecision({ action: 'CONSUME', ingredientId: ingredient.ingredientId, inventoryItemId: decision?.inventoryItemId ?? ingredient.selectedInventoryItemId ?? ingredient.options[0]?.inventoryItemId })} type="button">Consumir</button><button className="button button--text" onClick={() => setDecision({ action: 'IGNORE', ingredientId: ingredient.ingredientId })} type="button">Ignorar</button></> : null}</div></li>; })}</ul><section className="recipe-detail-section"><h2>Resumen</h2><p>{selectedDecisions.filter((decision) => decision.action === 'CONSUME').length} ingrediente{selectedDecisions.filter((decision) => decision.action === 'CONSUME').length === 1 ? '' : 's'} se descontarán y {selectedDecisions.filter((decision) => decision.action === 'IGNORE').length} se ignorarán.</p>{confirm.isError ? <p role="alert">No se pudo confirmar el consumo. Revisa las existencias e inténtalo nuevamente.</p> : null}<div className="recipe-form__actions"><Link className="button button--secondary" to={`/app/preparaciones/${batchId}`}>Volver</Link>{!value.alreadyConfirmed ? <button className="button button--primary" disabled={!allDecided || confirm.isPending} onClick={submit} type="button">{confirm.isPending ? 'Confirmando...' : 'Confirmar inventario'}</button> : null}</div></section></section>;
}

function statusLabel(status: string) {
  return ({ AVAILABLE: 'Disponible', INSUFFICIENT: 'Insuficiente', NO_INVENTORY: 'Sin inventario', IGNORED: 'Ignorado', CONFIRMED: 'Confirmado' } as Record<string, string>)[status] ?? status;
}
