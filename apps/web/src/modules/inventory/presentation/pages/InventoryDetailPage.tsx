import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import '../inventory.css';
import {
  useArchiveInventoryItem,
  useConsumeInventoryItem,
  useExpireInventoryItem,
  useInventoryItem,
  useInventoryMovements,
  useInventorySyncStatus,
  usePendingInventoryOperations,
  useUpdateInventoryItem,
  useWasteInventoryItem,
} from '../hooks/useInventory';

export function InventoryDetailPage() {
  const { inventoryItemId } = useParams<{ inventoryItemId: string }>();
  const navigate = useNavigate();
  const households = useHouseholds();
  const item = useInventoryItem(inventoryItemId);
  const movements = useInventoryMovements(inventoryItemId);
  const pending = usePendingInventoryOperations(households.activeHousehold?.id);
  const syncStatus = useInventorySyncStatus(households.activeHousehold?.id);
  const consume = useConsumeInventoryItem();
  const waste = useWasteInventoryItem();
  const expiration = useExpireInventoryItem();
  const update = useUpdateInventoryItem();
  const archive = useArchiveInventoryItem();
  const [action, setAction] = useState<
    'CONSUME' | 'WASTE' | 'EXPIRATION' | 'MINIMUM' | null
  >(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [occurredAt, setOccurredAt] = useState(toDateTimeLocal(new Date()));
  const [minimum, setMinimum] = useState('');

  if (households.isPending || item.isPending)
    return (
      <p className="page-section" role="status">
        Cargando existencia...
      </p>
    );
  if (
    households.isError ||
    !households.activeHousehold ||
    item.isError ||
    !item.data
  )
    return (
      <section className="page-section" role="alert">
        <p>No se pudo cargar la existencia.</p>
        <button
          className="button button--secondary"
          onClick={() => void item.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );

  const householdId = households.activeHousehold.id;
  const value = item.data;
  const itemPending =
    pending.data?.filter(
      (operation) => operation.inventoryItemId === value.id,
    ) ?? [];
  const sortedMovements = [...(movements.data ?? [])].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  const isArchived = value.status === 'ARCHIVED';
  const mutationError =
    consume.error ??
    waste.error ??
    expiration.error ??
    update.error ??
    archive.error;

  async function submitExit(kind: 'CONSUME' | 'WASTE' | 'EXPIRATION') {
    if (
      !quantity ||
      Number(quantity) <= 0 ||
      Number(quantity) > value.currentQuantity
    )
      return;
    const input = {
      quantity: Number(quantity),
      reason: reason.trim() || undefined,
      unit: value.unit,
      occurredAt: new Date(occurredAt),
    };
    try {
      if (kind === 'CONSUME')
        await consume.mutateAsync({ householdId, input, item: value });
      else if (kind === 'WASTE')
        await waste.mutateAsync({ householdId, input, item: value });
      else await expiration.mutateAsync({ householdId, input, item: value });
      setAction(null);
      setQuantity('');
      setReason('');
    } catch {
      // El error se muestra en la sección de acciones.
    }
  }

  async function updateMinimum() {
    if (!minimum.trim() || Number(minimum) < 0) return;
    try {
      await update.mutateAsync({
        itemId: value.id,
        input: { minimumQuantity: Number(minimum) },
      });
      setAction(null);
      setMinimum('');
    } catch {
      // El error se muestra en la sección de acciones.
    }
  }

  function archiveItem() {
    if (
      !window.confirm(
        'Archivar esta existencia la retirará del inventario activo. ¿Quieres continuar?',
      )
    )
      return;
    archive.mutate(value.id, { onSuccess: () => navigate('/app/inventario') });
  }

  return (
    <section
      className="page-section inventory-detail-page"
      aria-labelledby="inventory-detail-title"
    >
      <BackButton fallback="/app/inventario" />
      <p className="eyebrow">{itemTypeLabel(value.itemType)}</p>
      <h1 id="inventory-detail-title">{value.name}</h1>
      <p className="lead">
        Consulta el saldo actual y la historia de movimientos de esta
        existencia.
      </p>
      <div className="inventory-detail-actions">
        <span
          className={`status-badge${isArchived ? ' status-badge--danger' : ''}`}
        >
          {statusLabel(value.status)}
        </span>
        {!isArchived ? (
          <>
            <Link
              className="button button--primary"
              to={
                value.itemType === 'PREPARED_FOOD'
                  ? `/app/inventario/${value.id}/consumir-preparado`
                  : `/app/inventario/${value.id}/ajustar`
              }
            >
              {value.itemType === 'PREPARED_FOOD'
                ? 'Consumir preparado'
                : 'Ajustar cantidad'}
            </Link>
            {value.itemType !== 'PREPARED_FOOD' ? (
              <>
                <button
                  className="button button--secondary"
                  onClick={() =>
                    setAction(action === 'CONSUME' ? null : 'CONSUME')
                  }
                  type="button"
                >
                  Registrar consumo
                </button>
                <button
                  className="button button--secondary"
                  onClick={() => setAction(action === 'WASTE' ? null : 'WASTE')}
                  type="button"
                >
                  Registrar desperdicio
                </button>
                <button
                  className="button button--secondary"
                  onClick={() =>
                    setAction(action === 'EXPIRATION' ? null : 'EXPIRATION')
                  }
                  type="button"
                >
                  Registrar vencimiento
                </button>
              </>
            ) : null}
          </>
        ) : null}
      </div>
      <div className="inventory-sync-summary" role="status">
        {syncStatus.data?.isOnline === false ? 'Sin conexión' : 'Conectado'}
        {itemPending.length
          ? ` · ${itemPending.length} operación${itemPending.length === 1 ? '' : 'es'} pendiente${itemPending.length === 1 ? '' : 's'}`
          : ''}
      </div>
      <dl className="inventory-detail-meta">
        <div>
          <dt>Cantidad actual</dt>
          <dd>{formatQuantity(value.currentQuantity, value.unit)}</dd>
        </div>
        <div>
          <dt>Unidad</dt>
          <dd>{unitLabel(value.unit)}</dd>
        </div>
        <div>
          <dt>Mínimo</dt>
          <dd>
            {value.minimumQuantity == null
              ? 'Sin mínimo'
              : formatQuantity(value.minimumQuantity, value.unit)}
          </dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{value.location ?? 'No indicada'}</dd>
        </div>
        <div>
          <dt>Vencimiento</dt>
          <dd>
            {value.expiresAt
              ? new Intl.DateTimeFormat('es-AR', {
                  dateStyle: 'medium',
                }).format(new Date(value.expiresAt))
              : 'Sin vencimiento'}
          </dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{statusLabel(value.status)}</dd>
        </div>
      </dl>
      <section className="inventory-detail-section">
        <div className="inventory-section-heading">
          <div>
            <p className="eyebrow">Metadatos</p>
            <h2>Origen y alertas</h2>
          </div>
          {!isArchived ? (
            <button
              className="button button--secondary"
              onClick={() => setAction(action === 'MINIMUM' ? null : 'MINIMUM')}
              type="button"
            >
              Cambiar mínimo
            </button>
          ) : null}
        </div>
        <p>{sourceLink(value)}</p>
        {action === 'MINIMUM' ? (
          <div className="inventory-inline-form">
            <label htmlFor="inventory-minimum">Nuevo mínimo</label>
            <input
              id="inventory-minimum"
              inputMode="decimal"
              min="0"
              onChange={(event) => setMinimum(event.target.value)}
              step="any"
              type="number"
              value={minimum}
            />
            <button
              className="button button--primary"
              disabled={update.isPending}
              onClick={() => void updateMinimum()}
              type="button"
            >
              Guardar mínimo
            </button>
          </div>
        ) : null}
      </section>
      {action === 'CONSUME' || action === 'WASTE' || action === 'EXPIRATION' ? (
        <section className="inventory-detail-section inventory-action-form">
          <h2>
            {action === 'CONSUME'
              ? 'Registrar consumo'
              : action === 'WASTE'
                ? 'Registrar desperdicio'
                : 'Registrar vencimiento'}
          </h2>
          {action === 'EXPIRATION' ? (
            <p role="note">
              Al confirmar, esta cantidad se retirará por vencimiento y no
              generará una comida.
            </p>
          ) : null}
          <div className="inventory-inline-form">
            <label htmlFor="inventory-exit-quantity">
              Cantidad disponible:{' '}
              {formatQuantity(value.currentQuantity, value.unit)}
            </label>
            <input
              aria-describedby="inventory-exit-help"
              id="inventory-exit-quantity"
              inputMode="decimal"
              max={value.currentQuantity}
              min="0.1"
              onChange={(event) => setQuantity(event.target.value)}
              step="any"
              type="number"
              value={quantity}
            />
            <p className="supporting-text" id="inventory-exit-help">
              Saldo resultante:{' '}
              {formatQuantity(
                Math.max(value.currentQuantity - (Number(quantity) || 0), 0),
                value.unit,
              )}
            </p>
            <label htmlFor="inventory-exit-reason">Razón opcional</label>
            <input
              id="inventory-exit-reason"
              onChange={(event) => setReason(event.target.value)}
              type="text"
              value={reason}
            />
            <label htmlFor="inventory-exit-date">Fecha y hora</label>
            <input
              id="inventory-exit-date"
              onChange={(event) => setOccurredAt(event.target.value)}
              type="datetime-local"
              value={occurredAt}
            />
            <button
              className="button button--primary"
              disabled={
                consume.isPending ||
                waste.isPending ||
                expiration.isPending ||
                !quantity ||
                Number(quantity) > value.currentQuantity
              }
              onClick={() => void submitExit(action)}
              type="button"
            >
              {consume.isPending || waste.isPending || expiration.isPending
                ? 'Guardando...'
                : 'Confirmar'}
            </button>
          </div>
        </section>
      ) : null}
      {mutationError ? (
        <p className="form-field__error" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : 'No se pudo completar la acción.'}
        </p>
      ) : null}
      <section className="inventory-detail-section">
        <h2>Movimientos</h2>
        {movements.isPending ? (
          <p role="status">Cargando movimientos...</p>
        ) : null}
        {movements.isError ? (
          <p role="alert">No se pudo cargar el historial.</p>
        ) : null}
        {!movements.isPending &&
        !movements.isError &&
        sortedMovements.length === 0 ? (
          <p>No hay movimientos registrados todavía.</p>
        ) : null}
        {sortedMovements.length ? (
          <ol className="inventory-movement-list">
            {sortedMovements.map((movement) => (
              <li key={movement.id}>
                <div>
                  <strong>{movementLabel(movement.type)}</strong>
                  <span>{movement.reason ?? 'Sin razón indicada'}</span>
                </div>
                <div>
                  <strong className={movementDirection(movement.type)}>
                    {movementDirection(movement.type) === 'movement-in'
                      ? 'Entrada'
                      : 'Salida'}{' '}
                    · {formatQuantity(movement.quantity, movement.unit)}
                  </strong>
                  <span>
                    {formatDate(movement.occurredAt)} ·{' '}
                    {movement.actorId ?? 'Sistema'}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
      {itemPending.length ? (
        <section className="inventory-detail-section">
          <h2>Operaciones pendientes</h2>
          <ul className="inventory-pending-list">
            {itemPending.map((operation) => (
              <li key={operation.operationId}>
                Ajuste a {operation.newQuantity ?? operation.quantity}{' '}
                {unitLabel(operation.unit)} · pendiente de sincronización
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {!isArchived ? (
        <button
          className="button button--danger"
          onClick={archiveItem}
          type="button"
        >
          Archivar existencia
        </button>
      ) : (
        <p className="supporting-text">
          Esta existencia está archivada y se conserva como historial.
        </p>
      )}
    </section>
  );
}

function sourceLink(item: {
  foodId: string | null;
  preparedFoodLeftoverId: string | null;
}) {
  if (item.preparedFoodLeftoverId)
    return (
      <span>
        Proveniente de un sobrante:{' '}
        <Link to={`/app/sobrantes/${item.preparedFoodLeftoverId}`}>
          ver sobrante
        </Link>
      </span>
    );
  if (item.foodId)
    return (
      <span>
        Alimento del catálogo:{' '}
        <Link to={`/app/alimentos/${item.foodId}`}>ver alimento</Link>
      </span>
    );
  return 'Existencia personalizada';
}
function itemTypeLabel(type: string) {
  return type === 'PREPARED_FOOD'
    ? 'Preparación'
    : type === 'CUSTOM'
      ? 'Personalizado'
      : 'Alimento';
}
function statusLabel(status: string) {
  return status === 'ARCHIVED'
    ? 'Archivado'
    : status === 'DEPLETED'
      ? 'Agotado'
      : 'Activo';
}
function unitLabel(unit: string) {
  return unit === 'GRAM' ? 'g' : unit === 'MILLILITER' ? 'ml' : 'un.';
}
function formatQuantity(quantity: number, unit: string) {
  return `${quantity} ${unitLabel(unit)}`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
function movementLabel(type: string) {
  return (
    (
      {
        ADJUSTMENT_DECREASE: 'Ajuste de disminución',
        ADJUSTMENT_INCREASE: 'Ajuste de aumento',
        CONSUMPTION: 'Consumo',
        EXPIRATION: 'Vencimiento',
        MANUAL_ENTRY: 'Carga manual',
        PREPARATION_CONSUMPTION: 'Consumo de preparación',
        PURCHASE: 'Compra',
        REMAINDER_RETURN: 'Devolución de sobrante',
        WASTE: 'Desperdicio',
      } as Record<string, string>
    )[type] ?? type
  );
}
function movementDirection(type: string) {
  return [
    'ADJUSTMENT_INCREASE',
    'MANUAL_ENTRY',
    'PURCHASE',
    'REMAINDER_RETURN',
  ].includes(type)
    ? 'movement-in'
    : 'movement-out';
}
function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
