import { useState } from 'react';
import { Link } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import type { PurchaseStatus } from '../../domain/Purchase';
import { usePurchases } from '../hooks/usePurchases';
import '../purchases.css';

export function PurchaseListPage() {
  const households = useHouseholds();
  const [status, setStatus] = useState<PurchaseStatus | ''>('');
  const [storeName, setStoreName] = useState('');
  const purchases = usePurchases(households.activeHousehold?.id, {
    status: status || undefined,
    storeName: storeName.trim() || undefined,
  });

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

  const items = purchases.data?.items ?? [];
  return (
    <section
      className="page-section purchase-list-page"
      aria-labelledby="purchase-list-title"
    >
      <PageHeader
        action={
          <Link className="button button--primary" to="/app/compras/nueva">
            Registrar compra
          </Link>
        }
        eyebrow={households.activeHousehold.name}
        title="Compras del hogar"
        titleId="purchase-list-title"
        description="Consulta lo comprado y relaciona cada compra con tu inventario."
      />
      <div className="purchase-filters">
        <div className="form-field">
          <label htmlFor="purchase-store">Comercio</label>
          <input
            id="purchase-store"
            onChange={(event) => setStoreName(event.target.value)}
            placeholder="Ej. Mercado"
            value={storeName}
          />
        </div>
        <div className="form-field">
          <label htmlFor="purchase-status">Estado</label>
          <select
            id="purchase-status"
            onChange={(event) =>
              setStatus(event.target.value as PurchaseStatus | '')
            }
            value={status}
          >
            <option value="">Todos</option>
            <option value="DRAFT">Borradores</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>
      </div>
      {purchases.isPending ? <p role="status">Cargando compras...</p> : null}
      {purchases.isError ? (
        <div role="alert">
          <p>No se pudieron cargar las compras.</p>
          <button
            className="button button--secondary"
            onClick={() => void purchases.refetch()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!purchases.isPending && !purchases.isError && items.length === 0 ? (
        <section className="empty-state-card">
          <h2>No hay compras todavía</h2>
          <p>Registra tu primera compra para relacionarla con el inventario.</p>
          <Link className="button button--secondary" to="/app/compras/nueva">
            Registrar compra
          </Link>
        </section>
      ) : null}
      {items.length ? (
        <div className="purchase-list">
          {items.map((purchase) => (
            <Link
              className="purchase-card"
              key={purchase.id}
              to={`/app/compras/${purchase.id}`}
            >
              <div>
                <p className="eyebrow">{statusLabel(purchase.status)}</p>
                <h2>{purchase.storeName}</h2>
                <p>
                  {formatDate(purchase.purchaseDate)} · {purchase.items.length}{' '}
                  producto{purchase.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <strong>{formatMoney(purchase.total, purchase.currency)}</strong>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function statusLabel(status: string) {
  return status === 'CONFIRMED'
    ? 'Confirmada'
    : status === 'CANCELLED'
      ? 'Cancelada'
      : 'Borrador';
}
function formatDate(value: string) {
  return value
    ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
        new Date(value),
      )
    : 'Fecha no indicada';
}
function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-AR', { currency, style: 'currency' }).format(
    value,
  );
}
