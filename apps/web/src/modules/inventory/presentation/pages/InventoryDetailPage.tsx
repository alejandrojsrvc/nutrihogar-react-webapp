import { useCallback, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { BottomSheet, Dialog } from '../../../../shared/presentation/components/Overlay';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import type { PendingInventoryOperation } from '../../application/ports/InventoryLocalRepository';
import '../inventory.css';
import {
  useArchiveInventoryItem,
  useConsumeInventoryItem,
  useDiscardInventoryOperation,
  useExpireInventoryItem,
  useInventoryConflicts,
  useInventoryItem,
  useInventoryMovements,
  useInventorySyncStatus,
  usePendingInventoryOperations,
  useRetryInventoryOperation,
  useSynchronizeInventory,
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
  const conflicts = useInventoryConflicts(households.activeHousehold?.id);
  const syncStatus = useInventorySyncStatus(households.activeHousehold?.id);
  const synchronize = useSynchronizeInventory(households.activeHousehold?.id);
  const consume = useConsumeInventoryItem();
  const waste = useWasteInventoryItem();
  const expiration = useExpireInventoryItem();
  const update = useUpdateInventoryItem();
  const archive = useArchiveInventoryItem();
  const discardOperation = useDiscardInventoryOperation(
    households.activeHousehold?.id,
  );
  const retryOperation = useRetryInventoryOperation(
    households.activeHousehold?.id,
  );
  const [action, setAction] = useState<
    'CONSUME' | 'WASTE' | 'EXPIRATION' | 'MINIMUM' | null
  >(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [occurredAt, setOccurredAt] = useState(toDateTimeLocal(new Date()));
  const [minimum, setMinimum] = useState('');
  const [actionError, setActionError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const closeAction = useCallback(() => {
    setAction(null);
    setActionError('');
  }, []);
  const closeArchive = useCallback(() => setArchiveOpen(false), []);

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
          onClick={() =>
            void (households.isError || !households.activeHousehold
              ? households.refetch()
              : item.refetch())
          }
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
  const itemConflicts =
    conflicts.data?.filter(
      (operation) => operation.inventoryItemId === value.id,
    ) ?? [];
  const sortedMovements = [...(movements.data ?? [])].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  const isArchived = value.status === 'ARCHIVED';
  const exitError = consume.error ?? waste.error ?? expiration.error;
  const mutationError = exitError ?? update.error ?? archive.error;

  async function submitExit(kind: 'CONSUME' | 'WASTE' | 'EXPIRATION') {
    if (
      !quantity ||
      Number(quantity) <= 0 ||
      Number(quantity) > value.currentQuantity
    ) {
      setActionError(
        `Ingresa una cantidad mayor que cero que no supere ${formatQuantity(value.currentQuantity, value.unit)}.`,
      );
      return;
    }
    if (!occurredAt || Number.isNaN(new Date(occurredAt).getTime())) {
      setActionError('Indica una fecha y hora válidas.');
      return;
    }
    setActionError('');
    const queued =
      syncStatus.data?.isOnline === false ||
      (typeof navigator !== 'undefined' && !navigator.onLine);
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
      setFeedback(
        queued
          ? 'Cambio guardado en este dispositivo. Está pendiente de sincronización y todavía no fue confirmado por el servidor.'
          : 'Movimiento confirmado. El saldo mostrado fue actualizado por el servidor.',
      );
    } catch {
      // El error se muestra en la sección de acciones.
    }
  }

  async function updateMinimum() {
    if (
      !minimum.trim() ||
      !Number.isFinite(Number(minimum)) ||
      Number(minimum) < 0
    ) {
      setActionError('Ingresa un mínimo mayor o igual que cero.');
      return;
    }
    setActionError('');
    try {
      await update.mutateAsync({
        itemId: value.id,
        input: { minimumQuantity: Number(minimum) },
      });
      setAction(null);
      setMinimum('');
      setFeedback('Mínimo actualizado por el servidor.');
    } catch {
      // El error se muestra en la sección de acciones.
    }
  }

  function archiveItem() {
    archive.mutate(value.id, {
      onSuccess: () => navigate('/app/inventario'),
    });
  }

  function toggleAction(next: NonNullable<typeof action>) {
    consume.reset();
    waste.reset();
    expiration.reset();
    update.reset();
    setActionError('');
    setFeedback('');
    setAction(action === next ? null : next);
  }

  return (
    <section
      className="page-section inventory-detail-page"
      aria-labelledby="inventory-detail-title"
    >
      <BackButton fallback="/app/inventario" />
      <PageHeader
        description="Consulta el saldo disponible, sus alertas y el historial de cambios."
        eyebrow={itemTypeLabel(value.itemType)}
        icon={<PackageSearch size={22} />}
        title={value.name}
        titleId="inventory-detail-title"
      />
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
                  onClick={() => toggleAction('CONSUME')}
                  type="button"
                >
                  Registrar consumo
                </button>
                <button
                  className="button button--secondary"
                  onClick={() => toggleAction('WASTE')}
                  type="button"
                >
                  Registrar desperdicio
                </button>
                <button
                  className="button button--secondary"
                  onClick={() => toggleAction('EXPIRATION')}
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
        <strong>
          {syncStatus.isPending
            ? 'Comprobando sincronización'
            : synchronize.isPending
              ? 'Sincronizando cambios'
              : synchronize.isError
                ? 'No se pudieron sincronizar los cambios'
            : syncStatus.isError || pending.isError || conflicts.isError
              ? 'No se pudo comprobar la sincronización'
            : syncStatus.data?.isOnline === false
              ? 'Viendo datos guardados en este dispositivo'
              : syncStatus.data?.conflictsCount
                ? 'Hay un conflicto de sincronización'
                : itemPending.length
                  ? 'Pendiente de sincronización'
                  : 'Saldo confirmado por el servidor'}
        </strong>
        <span>
          {itemPending.length
            ? `${itemPending.length} cambio${itemPending.length === 1 ? '' : 's'} local${itemPending.length === 1 ? '' : 'es'} todavía sin confirmar.`
            : syncStatus.isError || pending.isError || conflicts.isError
              ? 'Reintenta para verificar si existen cambios locales pendientes.'
            : syncStatus.data?.isOnline === false
              ? 'El saldo puede no incluir cambios realizados desde otros dispositivos.'
              : itemConflicts.length
                ? 'Revisa el conflicto de esta existencia antes de continuar.'
                : 'No hay cambios locales pendientes para esta existencia.'}
        </span>
        {syncStatus.isError || pending.isError || conflicts.isError || synchronize.isError ? (
          <button
            className="button button--secondary"
            onClick={() => {
              if (synchronize.isError && navigator.onLine) synchronize.mutate();
              void Promise.all([
                syncStatus.refetch(),
                pending.refetch(),
                conflicts.refetch(),
              ]);
            }}
            type="button"
          >
            Reintentar estado
          </button>
        ) : null}
      </div>
      {feedback ? <p className="inventory-feedback" role="status">{feedback}</p> : null}
      <dl className="inventory-detail-meta">
        <div>
          <dt>{itemPending.length ? 'Cantidad mostrada' : 'Cantidad actual'}</dt>
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
              onClick={() => toggleAction('MINIMUM')}
              type="button"
            >
              Cambiar mínimo
            </button>
          ) : null}
        </div>
        <p>{sourceLink(value)}</p>
      </section>
      {action === 'CONSUME' || action === 'WASTE' || action === 'EXPIRATION' ? (
        <BottomSheet
          onClose={closeAction}
          open
          title={
            action === 'CONSUME'
              ? 'Registrar consumo'
              : action === 'WASTE'
                ? 'Registrar desperdicio'
                : 'Registrar vencimiento'
          }
        >
          <div className="inventory-action-form">
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
                expiration.isPending
              }
              onClick={() => void submitExit(action)}
              type="button"
            >
              {consume.isPending || waste.isPending || expiration.isPending
                ? syncStatus.data?.isOnline === false
                  ? 'Guardando en dispositivo...'
                  : 'Guardando...'
                : syncStatus.data?.isOnline === false
                  ? action === 'CONSUME'
                    ? 'Guardar consumo pendiente'
                    : action === 'WASTE'
                      ? 'Guardar desperdicio pendiente'
                      : 'Guardar vencimiento pendiente'
                  : action === 'CONSUME'
                    ? 'Registrar consumo'
                    : action === 'WASTE'
                      ? 'Registrar desperdicio'
                      : 'Registrar vencimiento'}
            </button>
          </div>
          {actionError ? <p className="form-field__error" role="alert">{actionError}</p> : null}
          {exitError ? (
            <p className="form-field__error" role="alert">
              {exitError instanceof Error ? exitError.message : 'No se pudo completar la acción.'}
            </p>
          ) : null}
          </div>
        </BottomSheet>
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
          <div role="alert">
            <p>No se pudo cargar el historial.</p>
            <button className="button button--secondary" onClick={() => void movements.refetch()} type="button">Reintentar historial</button>
          </div>
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
                {pendingOperationLabel(operation)} ·{' '}
                {inventoryOperationStatusLabel(operation.syncStatus)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {itemConflicts.length ? (
        <section className="inventory-detail-section" aria-labelledby="inventory-conflicts-title">
          <h2 id="inventory-conflicts-title">Conflictos por revisar</h2>
          <p className="supporting-text">
            El saldo del servidor cambió antes de aplicar estos cambios locales. Reintentar los vuelve a poner en cola; no los confirma de inmediato.
          </p>
          <ul className="inventory-conflict-list">
            {itemConflicts.map((operation) => (
              <li key={operation.operationId}>
                <div>
                  <strong>{operation.movementType ? movementLabel(operation.movementType) : 'Ajuste de cantidad'}</strong>
                  <span>{operation.lastError ?? 'El servidor rechazó la versión usada por este cambio.'}</span>
                </div>
                <div className="inventory-conflict-actions">
                  {operation.retryable !== false ? (
                    <button
                      className="button button--secondary"
                      disabled={retryOperation.isPending || syncStatus.data?.isOnline === false}
                      onClick={() => {
                        void retryOperation
                          .mutateAsync({
                            baseVersion:
                              operation.resultingVersion ??
                              operation.baseVersion,
                            operationId: operation.operationId,
                          })
                          .then(() => {
                            if (navigator.onLine) synchronize.mutate();
                          })
                          .catch(() => undefined);
                      }}
                      type="button"
                    >
                      Reintentar al sincronizar
                    </button>
                  ) : null}
                  <button
                    className="button button--text inventory-danger-text"
                    disabled={discardOperation.isPending}
                    onClick={() => discardOperation.mutate(operation.operationId)}
                    type="button"
                  >
                    Descartar cambio local
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {retryOperation.error || discardOperation.error || synchronize.error ? (
            <p className="form-field__error" role="alert">
              No se pudo actualizar el cambio pendiente. Inténtalo nuevamente.
            </p>
          ) : null}
        </section>
      ) : null}
      {!isArchived ? (
        <button
          className="button button--danger"
          disabled={syncStatus.data?.isOnline === false}
          onClick={() => {
            archive.reset();
            setArchiveOpen(true);
          }}
          type="button"
        >
          Archivar existencia
        </button>
      ) : (
        <p className="supporting-text">
          Esta existencia está archivada y se conserva como historial.
        </p>
      )}
      <BottomSheet
        onClose={closeAction}
        open={action === 'MINIMUM'}
        title="Cambiar mínimo"
      >
        <div className="inventory-inline-form">
          <label htmlFor="inventory-minimum">Nuevo mínimo ({unitLabel(value.unit)})</label>
          <input
            id="inventory-minimum"
            inputMode="decimal"
            min="0"
            onChange={(event) => setMinimum(event.target.value)}
            step="any"
            type="number"
            value={minimum}
          />
          {actionError ? <p className="form-field__error" role="alert">{actionError}</p> : null}
          {update.error ? (
            <p className="form-field__error" role="alert">
              {update.error instanceof Error ? update.error.message : 'No se pudo cambiar el mínimo.'}
            </p>
          ) : null}
          <button
            className="button button--primary"
            disabled={update.isPending || syncStatus.data?.isOnline === false}
            onClick={() => void updateMinimum()}
            type="button"
          >
            {update.isPending ? 'Guardando...' : 'Guardar mínimo'}
          </button>
          {syncStatus.data?.isOnline === false ? <p className="supporting-text">Cambiar el mínimo requiere conexión y no se guarda como operación pendiente.</p> : null}
        </div>
      </BottomSheet>
      <Dialog onClose={closeArchive} open={archiveOpen} title="Archivar existencia">
        <p>La existencia se retirará del inventario activo, pero su historial se conservará. Esta acción requiere confirmación del servidor.</p>
        {archive.error ? <p className="form-field__error" role="alert">No se pudo archivar la existencia.</p> : null}
        <div className="inventory-dialog-actions">
          <button className="button button--secondary" onClick={closeArchive} type="button">Conservar existencia</button>
          <button className="button button--danger" disabled={archive.isPending} onClick={archiveItem} type="button">
            {archive.isPending ? 'Archivando...' : 'Archivar existencia'}
          </button>
        </div>
      </Dialog>
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

function pendingOperationLabel(operation: PendingInventoryOperation) {
  if (operation.type === 'ABSOLUTE_ADJUSTMENT')
    return `Ajuste a ${operation.newQuantity} ${unitLabel(operation.unit)}`;
  return `${movementLabel(operation.movementType ?? 'MOVEMENT')} de ${operation.quantity} ${unitLabel(operation.unit)}`;
}

function inventoryOperationStatusLabel(
  status: PendingInventoryOperation['syncStatus'],
) {
  return status === 'SYNCING'
    ? 'sincronizando'
    : status === 'FAILED'
      ? 'falló la sincronización; se reintentará'
      : 'pendiente de sincronización';
}
function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
