import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  AlertTriangle,
  ChartPie,
  CircleCheck,
  PackageOpen,
  Search,
  ShoppingCart,
  Snowflake,
} from 'lucide-react';

import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import '../inventory.css';
import type {
  InventoryItem,
  InventoryItemType,
  InventoryItemStatus,
} from '../../domain/Inventory';
import {
  useDiscardInventoryOperation,
  useInventory,
  useInventoryConflicts,
  useInventorySyncStatus,
  useRetryInventoryOperation,
  useSynchronizeInventory,
} from '../hooks/useInventory';

type SpecialFilter = 'ALL' | 'BELOW_MINIMUM' | 'DEPLETED' | 'EXPIRING';

export function InventoryListPage() {
  const households = useHouseholds();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('query') ?? '');
  const [itemType, setItemType] = useState<InventoryItemType | ''>('');
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>(() =>
    searchParams.get('status') === 'DEPLETED'
      ? 'DEPLETED'
      : searchParams.get('belowMinimum') === 'true'
        ? 'BELOW_MINIMUM'
        : searchParams.has('expiresBefore')
          ? 'EXPIRING'
          : 'ALL',
  );
  const filters = {
    belowMinimum: specialFilter === 'BELOW_MINIMUM' ? true : undefined,
    expiresBefore: specialFilter === 'EXPIRING' ? inThirtyDays() : undefined,
    itemType: itemType || undefined,
    query: search.trim() || undefined,
    status:
      specialFilter === 'DEPLETED'
        ? ('DEPLETED' as InventoryItemStatus)
        : undefined,
  };
  const inventory = useInventory(households.activeHousehold?.id, filters);
  const syncStatus = useInventorySyncStatus(households.activeHousehold?.id);
  const synchronize = useSynchronizeInventory(households.activeHousehold?.id);
  const conflicts = useInventoryConflicts(households.activeHousehold?.id);
  const discardConflict = useDiscardInventoryOperation(
    households.activeHousehold?.id,
  );
  const retryConflict = useRetryInventoryOperation(
    households.activeHousehold?.id,
  );
  const visibleItems = useMemo(
    () =>
      filterSnapshot(
        inventory.data?.items ?? [],
        search,
        itemType,
        specialFilter,
      ),
    [inventory.data?.items, itemType, search, specialFilter],
  );

  if (households.isPending)
    return (
      <p className="page-section" role="status">
        Cargando hogar...
      </p>
    );
  if (households.isError || !households.activeHousehold)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar el hogar activo.
      </p>
    );

  return (
    <section
      className="page-section inventory-page"
      aria-labelledby="inventory-title"
    >
      <SyncStatus
        conflictsCount={syncStatus.data?.conflictsCount ?? 0}
        isOnline={syncStatus.data?.isOnline ?? true}
        lastSyncAt={syncStatus.data?.lastSyncAt ?? null}
        pendingCount={syncStatus.data?.pendingCount ?? 0}
        isSyncing={synchronize.isPending}
        onSynchronize={() => synchronize.mutate()}
      />
      {conflicts.data?.length ? (
        <section
          className="inventory-conflicts"
          aria-labelledby="inventory-conflicts-title"
        >
          <h2 id="inventory-conflicts-title">
            Revisa operaciones con conflicto
          </h2>
          <ul>
            {conflicts.data.map((operation) => {
              const itemName =
                inventory.data?.items.find(
                  (item) => item.id === operation.inventoryItemId,
                )?.name ??
                operation.snapshot?.name ??
                'una existencia';
              const baseVersion =
                operation.resultingVersion ?? operation.snapshot?.version;
              return (
                <li key={operation.operationId}>
                  <span>
                    Operación sobre {itemName}
                    {operation.conflictCode
                      ? ` · ${conflictLabel(operation.conflictCode)}`
                      : ''}
                    {operation.lastError ? `: ${operation.lastError}` : ''}
                  </span>
                  {operation.retryable && baseVersion != null ? (
                    <button
                      className="button button--text"
                      disabled={retryConflict.isPending}
                      onClick={() =>
                        retryConflict.mutate({
                          baseVersion,
                          operationId: operation.operationId,
                        })
                      }
                      type="button"
                    >
                      Reintentar
                    </button>
                  ) : null}
                  <button
                    className="button button--text"
                    disabled={discardConflict.isPending}
                    onClick={() =>
                      discardConflict.mutate(operation.operationId)
                    }
                    type="button"
                  >
                    Descartar
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <div className="inventory-toolbar">
        <div className="inventory-search">
          <Search size={20} aria-hidden="true" />
          <label className="visually-hidden" htmlFor="inventory-search">
            Buscar productos
          </label>
          <input
            id="inventory-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos"
            type="search"
            value={search}
          />
        </div>
        <div className="inventory-filter-chips" aria-label="Filtrar inventario">
          <FilterChip
            active={specialFilter === 'ALL' && !itemType}
            label="Todo"
            onClick={() => {
              setItemType('');
              setSpecialFilter('ALL');
            }}
          />
          <FilterChip
            active={specialFilter === 'BELOW_MINIMUM'}
            label="Bajo stock"
            onClick={() => {
              setItemType('');
              setSpecialFilter('BELOW_MINIMUM');
            }}
            tone="warning"
          />
          <FilterChip
            active={specialFilter === 'EXPIRING'}
            label="Por vencer"
            onClick={() => {
              setItemType('');
              setSpecialFilter('EXPIRING');
            }}
            tone="danger"
          />
          <FilterChip
            active={specialFilter === 'DEPLETED'}
            label="Agotados"
            onClick={() => {
              setItemType('');
              setSpecialFilter('DEPLETED');
            }}
            tone="warning"
          />
          <FilterChip
            active={itemType === 'FOOD'}
            label="Alimentos"
            onClick={() => {
              setItemType('FOOD');
              setSpecialFilter('ALL');
            }}
          />
          <FilterChip
            active={itemType === 'PREPARED_FOOD'}
            label="Preparados"
            onClick={() => {
              setItemType('PREPARED_FOOD');
              setSpecialFilter('ALL');
            }}
          />
          <FilterChip
            active={itemType === 'CUSTOM'}
            label="Personalizados"
            onClick={() => {
              setItemType('CUSTOM');
              setSpecialFilter('ALL');
            }}
          />
          <button
            className="inventory-filter-chip"
            disabled
            title="Disponible próximamente"
            type="button"
          >
            Compras pendientes
          </button>
        </div>
      </div>
      {inventory.isPending ? (
        <p className="summary-status" role="status">
          Cargando inventario...
        </p>
      ) : null}
      {inventory.isError ? (
        <div role="alert">
          <p>No se pudo cargar el inventario.</p>
          <button
            className="button button--secondary"
            onClick={() => void inventory.refetch()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!inventory.isPending &&
      !inventory.isError &&
      visibleItems.length === 0 ? (
        <EmptyState
          title={
            search || specialFilter !== 'ALL'
              ? 'No encontramos existencias'
              : 'Todavía no hay existencias'
          }
          description={
            search || specialFilter !== 'ALL'
              ? 'Prueba con otra búsqueda o filtro.'
              : 'Agrega la primera existencia de tu hogar para verla aquí.'
          }
        />
      ) : null}
      {visibleItems.length > 0 ? (
        <div className="inventory-dashboard">
          <div className="inventory-list" aria-label="Existencias del hogar">
            <div className="inventory-list__head" aria-hidden="true">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Ubicación</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {visibleItems.map((item) => (
              <InventoryCard item={item} key={item.id} />
            ))}
          </div>
          <InventoryInsights items={inventory.data?.items ?? []} />
        </div>
      ) : null}
    </section>
  );
}

function InventoryCard({ item }: { item: InventoryItem }) {
  const belowMinimum =
    item.minimumQuantity != null &&
    item.currentQuantity <= item.minimumQuantity;
  const depleted = item.status === 'DEPLETED' || item.currentQuantity <= 0;
  return (
    <article className="inventory-row">
      <div className="inventory-row__product">
        <span className="inventory-row__icon" aria-hidden="true">
          {item.itemType === 'PREPARED_FOOD' ? (
            <Snowflake size={22} />
          ) : (
            <PackageOpen size={22} />
          )}
        </span>
        <div>
          <h2>{item.name}</h2>
          <small>{itemTypeLabel(item.itemType)}</small>
        </div>
      </div>
      <p className="inventory-row__quantity">
        {formatQuantity(item.currentQuantity, item.unit)}
      </p>
      <p className="inventory-row__location">
        {item.location ?? 'Sin ubicación'}
        {item.expiresAt ? (
          <small>Vence {formatDate(item.expiresAt)}</small>
        ) : null}
      </p>
      <div className="inventory-row__status">
        <span
          className={`inventory-status inventory-status--${depleted ? 'danger' : belowMinimum ? 'warning' : item.itemType === 'PREPARED_FOOD' ? 'info' : 'success'}`}
        >
          {depleted
            ? 'Agotado'
            : belowMinimum
              ? 'Bajo stock'
              : item.itemType === 'PREPARED_FOOD'
                ? 'Preparado'
                : 'Buen stock'}
        </span>
      </div>
      <div className="inventory-row__actions">
        <Link
          className="button button--tertiary"
          to={`/app/inventario/${item.id}/ajustar`}
        >
          Ajustar
        </Link>
        <Link className="button button--text" to={`/app/inventario/${item.id}`}>
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  tone,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone?: 'warning' | 'danger';
}) {
  return (
    <button
      aria-pressed={active}
      className={`inventory-filter-chip${tone ? ` inventory-filter-chip--${tone}` : ''}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function InventoryInsights({ items }: { items: InventoryItem[] }) {
  const depleted = items.filter(
    (item) => item.status === 'DEPLETED' || item.currentQuantity <= 0,
  ).length;
  const belowMinimum = items.filter(
    (item) =>
      item.currentQuantity > 0 &&
      item.minimumQuantity != null &&
      item.currentQuantity <= item.minimumQuantity,
  ).length;
  const expiring = items.filter((item) =>
    isExpiringSoon(item.expiresAt),
  ).length;
  const attention = items.filter(
    (item) =>
      item.status === 'DEPLETED' ||
      item.currentQuantity <= 0 ||
      (item.minimumQuantity != null &&
        item.currentQuantity <= item.minimumQuantity) ||
      isExpiringSoon(item.expiresAt),
  ).length;
  const healthy = items.length - attention;
  return (
    <aside className="inventory-insights" aria-label="Resumen del inventario">
      <section>
        <div className="inventory-insights__heading">
          <AlertTriangle size={19} aria-hidden="true" />
          <h2>Alertas</h2>
        </div>
        <ul>
          <li>
            <strong>{expiring} por vencer</strong>
            <span>Revisa las próximas fechas</span>
          </li>
          <li>
            <strong>{belowMinimum} bajo stock</strong>
            <span>Puede ser momento de reponer</span>
          </li>
          <li>
            <strong>{depleted} agotados</strong>
            <span>Sin unidades disponibles</span>
          </li>
        </ul>
      </section>
      <section>
        <div className="inventory-insights__heading">
          <ChartPie size={19} aria-hidden="true" />
          <h2>Resumen</h2>
        </div>
        <dl>
          <div>
            <dt>Total productos</dt>
            <dd>{items.length}</dd>
          </div>
          <div>
            <dt>Buen stock</dt>
            <dd>{healthy}</dd>
          </div>
          <div>
            <dt>Requieren atención</dt>
            <dd>{attention}</dd>
          </div>
        </dl>
      </section>
      <section>
        <div className="inventory-insights__heading">
          <ShoppingCart size={19} aria-hidden="true" />
          <h2>Lista de compras</h2>
        </div>
        <p>Consulta los productos que el hogar necesita reponer.</p>
        <Link to="/app/lista-de-compras">Ver lista completa</Link>
      </section>
      {items.length > 0 && healthy === items.length ? (
        <p className="inventory-insights__ok">
          <CircleCheck size={18} aria-hidden="true" /> Todo está en orden
        </p>
      ) : null}
    </aside>
  );
}

function SyncStatus({
  conflictsCount,
  isOnline,
  lastSyncAt,
  pendingCount,
  isSyncing,
  onSynchronize,
}: {
  conflictsCount: number;
  isOnline: boolean;
  lastSyncAt: string | null;
  pendingCount: number;
  isSyncing: boolean;
  onSynchronize: () => void;
}) {
  return (
    <div className="inventory-sync" role="status">
      <span>
        {isOnline ? 'Conectado' : 'Sin conexión'}
        {pendingCount > 0
          ? ` · ${pendingCount} operación${pendingCount === 1 ? '' : 'es'} pendiente${pendingCount === 1 ? '' : 's'}`
          : ''}
        {conflictsCount > 0
          ? ` · ${conflictsCount} conflicto${conflictsCount === 1 ? '' : 's'}`
          : ''}
        {lastSyncAt
          ? ` · Última sincronización: ${formatDateTime(lastSyncAt)}`
          : ''}
      </span>
      {pendingCount > 0 && isOnline ? (
        <button
          className="button button--tertiary"
          disabled={isSyncing}
          onClick={onSynchronize}
          type="button"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      ) : null}
    </div>
  );
}

function filterSnapshot<
  T extends {
    name: string;
    itemType: InventoryItemType;
    status: InventoryItemStatus;
    currentQuantity: number;
    minimumQuantity: number | null;
    expiresAt: string | null;
  },
>(
  items: T[],
  search: string,
  itemType: InventoryItemType | '',
  specialFilter: SpecialFilter,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase();
  return items.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      item.name.toLocaleLowerCase().includes(normalizedSearch);
    const matchesType = !itemType || item.itemType === itemType;
    const matchesSpecial =
      specialFilter === 'ALL' ||
      (specialFilter === 'DEPLETED' &&
        (item.status === 'DEPLETED' || item.currentQuantity <= 0)) ||
      (specialFilter === 'BELOW_MINIMUM' &&
        item.minimumQuantity != null &&
        item.currentQuantity <= item.minimumQuantity) ||
      (specialFilter === 'EXPIRING' &&
        item.expiresAt != null &&
        item.expiresAt <= inThirtyDays());
    return matchesSearch && matchesType && matchesSpecial;
  });
}

function itemTypeLabel(type: InventoryItemType) {
  return type === 'PREPARED_FOOD'
    ? 'Preparación'
    : type === 'CUSTOM'
      ? 'Personalizado'
      : 'Alimento';
}
function formatQuantity(quantity: number, unit: string) {
  return `${quantity} ${unit === 'GRAM' ? 'g' : unit === 'MILLILITER' ? 'ml' : 'un.'}`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}
function inThirtyDays() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}
function isExpiringSoon(value: string | null) {
  return value != null && value <= inThirtyDays();
}
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
function conflictLabel(value: string) {
  return (
    (
      {
        INSUFFICIENT_BALANCE: 'Saldo insuficiente',
        ARCHIVED_ITEM: 'Existencia archivada',
        INCOMPATIBLE_UNIT: 'Unidad incompatible',
        FORBIDDEN: 'Permiso perdido',
        RETRYABLE: 'Reintentable',
      } as Record<string, string>
    )[value] ?? value
  );
}
