import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import type { InventoryItem, InventoryItemType, InventoryItemStatus } from '../../domain/Inventory';
import { useDiscardInventoryOperation, useInventory, useInventoryConflicts, useInventorySyncStatus, useRetryInventoryOperation, useSynchronizeInventory } from '../hooks/useInventory';

type SpecialFilter = 'ALL' | 'BELOW_MINIMUM' | 'DEPLETED' | 'EXPIRING';

export function InventoryListPage() {
  const households = useHouseholds();
  const [search, setSearch] = useState('');
  const [itemType, setItemType] = useState<InventoryItemType | ''>('');
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>('ALL');
  const filters = {
    belowMinimum: specialFilter === 'BELOW_MINIMUM' ? true : undefined,
    expiresBefore: specialFilter === 'EXPIRING' ? inThirtyDays() : undefined,
    itemType: itemType || undefined,
    query: search.trim() || undefined,
    status: specialFilter === 'DEPLETED' ? 'DEPLETED' as InventoryItemStatus : undefined,
  };
  const inventory = useInventory(households.activeHousehold?.id, filters);
  const syncStatus = useInventorySyncStatus(households.activeHousehold?.id);
  const synchronize = useSynchronizeInventory(households.activeHousehold?.id);
  const conflicts = useInventoryConflicts(households.activeHousehold?.id);
  const discardConflict = useDiscardInventoryOperation(households.activeHousehold?.id);
  const retryConflict = useRetryInventoryOperation(households.activeHousehold?.id);
  const visibleItems = useMemo(() => filterSnapshot(inventory.data?.items ?? [], search, itemType, specialFilter), [inventory.data?.items, itemType, search, specialFilter]);

  if (households.isPending) return <p className="page-section" role="status">Cargando hogar...</p>;
  if (households.isError || !households.activeHousehold) return <p className="page-section" role="alert">No se pudo cargar el hogar activo.</p>;

  return (
    <section className="page-section inventory-page" aria-labelledby="inventory-title">
      <BackButton fallback="/app" />
      <PageHeader action={<Link className="button button--primary" to="/app/inventario/nuevo">Agregar existencia</Link>} eyebrow={households.activeHousehold.name} title="Inventario del hogar" titleId="inventory-title" description="Consulta lo que tienes disponible y mantenlo actualizado." />
      <SyncStatus conflictsCount={syncStatus.data?.conflictsCount ?? 0} isOnline={syncStatus.data?.isOnline ?? true} lastSyncAt={syncStatus.data?.lastSyncAt ?? null} pendingCount={syncStatus.data?.pendingCount ?? 0} isSyncing={synchronize.isPending} onSynchronize={() => synchronize.mutate()} />
      {conflicts.data?.length ? <section className="inventory-conflicts" aria-labelledby="inventory-conflicts-title"><h2 id="inventory-conflicts-title">Revisa operaciones con conflicto</h2><ul>{conflicts.data.map((operation) => <li key={operation.operationId}><span>Operación sobre {operation.inventoryItemId}{operation.conflictCode ? ` · ${conflictLabel(operation.conflictCode)}` : ''}{operation.lastError ? `: ${operation.lastError}` : ''}</span>{operation.retryable ? <button className="button button--text" disabled={retryConflict.isPending} onClick={() => retryConflict.mutate({ baseVersion: operation.resultingVersion ?? 0, operationId: operation.operationId })} type="button">Reintentar</button> : null}<button className="button button--text" disabled={discardConflict.isPending} onClick={() => discardConflict.mutate(operation.operationId)} type="button">Descartar</button></li>)}</ul></section> : null}
      <div className="inventory-filters">
        <div className="form-field"><label htmlFor="inventory-search">Buscar existencia</label><input id="inventory-search" onChange={(event) => setSearch(event.target.value)} placeholder="Ej. arroz o freezer" type="search" value={search} /></div>
        <div className="form-field"><label htmlFor="inventory-type">Tipo</label><select id="inventory-type" onChange={(event) => setItemType(event.target.value as InventoryItemType | '')} value={itemType}><option value="">Todos</option><option value="FOOD">Alimentos</option><option value="PREPARED_FOOD">Preparaciones</option><option value="CUSTOM">Personalizados</option></select></div>
        <div className="form-field"><label htmlFor="inventory-status">Estado</label><select id="inventory-status" onChange={(event) => setSpecialFilter(event.target.value as SpecialFilter)} value={specialFilter}><option value="ALL">Todos</option><option value="BELOW_MINIMUM">Bajo mínimo</option><option value="DEPLETED">Agotados</option><option value="EXPIRING">Próximos a vencer</option></select></div>
      </div>
      {inventory.isPending ? <p className="summary-status" role="status">Cargando inventario...</p> : null}
      {inventory.isError ? <div role="alert"><p>No se pudo cargar el inventario.</p><button className="button button--secondary" onClick={() => void inventory.refetch()} type="button">Reintentar</button></div> : null}
      {!inventory.isPending && !inventory.isError && visibleItems.length === 0 ? <EmptyState title={search || specialFilter !== 'ALL' ? 'No encontramos existencias' : 'Todavía no hay existencias'} description={search || specialFilter !== 'ALL' ? 'Prueba con otra búsqueda o filtro.' : 'Agrega la primera existencia de tu hogar para verla aquí.'} /> : null}
      {visibleItems.length > 0 ? <div className="inventory-list" aria-label="Existencias del hogar">{visibleItems.map((item) => <InventoryCard item={item} key={item.id} />)}</div> : null}
    </section>
  );
}

function InventoryCard({ item }: { item: InventoryItem }) {
  const belowMinimum = item.minimumQuantity != null && item.currentQuantity <= item.minimumQuantity;
  const depleted = item.status === 'DEPLETED' || item.currentQuantity <= 0;
  return <article className="inventory-card"><div><p className="eyebrow">{itemTypeLabel(item.itemType)}</p><h2>{item.name}</h2><p className="inventory-card__quantity"><strong>{formatQuantity(item.currentQuantity, item.unit)}</strong>{item.minimumQuantity != null ? ` · mínimo ${formatQuantity(item.minimumQuantity, item.unit)}` : ''}</p><p>{item.location ?? 'Ubicación no indicada'}{item.expiresAt ? ` · vence ${formatDate(item.expiresAt)}` : ''}</p><div className="inventory-card__statuses">{depleted ? <span className="status-badge">Agotado</span> : null}{belowMinimum && !depleted ? <span className="status-badge">Bajo mínimo</span> : null}{item.itemType === 'PREPARED_FOOD' ? <span className="status-badge">Preparado</span> : null}</div></div><div className="inventory-card__actions"><Link className="button button--secondary" to={`/app/inventario/${item.id}`}>Ver detalle</Link><Link className="button button--secondary" to={`/app/inventario/${item.id}/ajustar`}>Ajustar</Link></div></article>;
}

function SyncStatus({ conflictsCount, isOnline, lastSyncAt, pendingCount, isSyncing, onSynchronize }: { conflictsCount: number; isOnline: boolean; lastSyncAt: string | null; pendingCount: number; isSyncing: boolean; onSynchronize: () => void }) {
  return <div className="inventory-sync" role="status"><span>{isOnline ? 'Conectado' : 'Sin conexión'}{pendingCount > 0 ? ` · ${pendingCount} operación${pendingCount === 1 ? '' : 'es'} pendiente${pendingCount === 1 ? '' : 's'}` : ''}{conflictsCount > 0 ? ` · ${conflictsCount} conflicto${conflictsCount === 1 ? '' : 's'}` : ''}{lastSyncAt ? ` · Última sincronización: ${formatDateTime(lastSyncAt)}` : ''}</span>{pendingCount > 0 && isOnline ? <button className="button button--tertiary" disabled={isSyncing} onClick={onSynchronize} type="button">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</button> : null}</div>;
}

function filterSnapshot<T extends { name: string; itemType: InventoryItemType; status: InventoryItemStatus; currentQuantity: number; minimumQuantity: number | null; expiresAt: string | null }>(items: T[], search: string, itemType: InventoryItemType | '', specialFilter: SpecialFilter) {
  const normalizedSearch = search.trim().toLocaleLowerCase();
  return items.filter((item) => {
    const matchesSearch = !normalizedSearch || item.name.toLocaleLowerCase().includes(normalizedSearch);
    const matchesType = !itemType || item.itemType === itemType;
    const matchesSpecial = specialFilter === 'ALL'
      || (specialFilter === 'DEPLETED' && (item.status === 'DEPLETED' || item.currentQuantity <= 0))
      || (specialFilter === 'BELOW_MINIMUM' && item.minimumQuantity != null && item.currentQuantity <= item.minimumQuantity)
      || (specialFilter === 'EXPIRING' && item.expiresAt != null && item.expiresAt <= inThirtyDays());
    return matchesSearch && matchesType && matchesSpecial;
  });
}

function itemTypeLabel(type: InventoryItemType) { return type === 'PREPARED_FOOD' ? 'Preparación' : type === 'CUSTOM' ? 'Personalizado' : 'Alimento'; }
function formatQuantity(quantity: number, unit: string) { return `${quantity} ${unit === 'GRAM' ? 'g' : unit === 'MILLILITER' ? 'ml' : 'un.'}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(value)); }
function inThirtyDays() { return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
function conflictLabel(value: string) { return ({ INSUFFICIENT_BALANCE: 'Saldo insuficiente', ARCHIVED_ITEM: 'Existencia archivada', INCOMPATIBLE_UNIT: 'Unidad incompatible', FORBIDDEN: 'Permiso perdido', RETRYABLE: 'Reintentable' } as Record<string, string>)[value] ?? value; }
