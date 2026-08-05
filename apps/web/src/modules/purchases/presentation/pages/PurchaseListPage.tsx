import { useState } from 'react';
import { Link } from 'react-router';

import { LoadingState } from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import type { PurchaseStatus } from '../../domain/Purchase';
import { usePurchaseConnectivity, usePurchases } from '../hooks/usePurchases';
import '../purchases.css';

export function PurchaseListPage() {
  const households = useHouseholds();
  const isOnline = usePurchaseConnectivity();
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
      <section className="page-section" role="alert">
        <p>
          {isOnline
            ? 'No se pudo cargar el hogar activo.'
            : 'No se pudo identificar el hogar sin conexión.'}
        </p>
        <button
          className="button button--secondary"
          onClick={() => void households.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );

  const items = purchases.data?.items ?? [];
  return (
    <section
      className="page-section purchase-list-page"
      aria-labelledby="purchase-list-title"
    >
      {!isOnline ? (
        <p
          className="feature-connectivity feature-connectivity--offline"
          role="status"
        >
          Sin conexión. Las compras requieren conexión y no se guardan en una
          cola local.
        </p>
      ) : null}
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
        <Link className="button button--primary" to="/app/compras/nueva">
          Registrar compra
        </Link>
      </div>
      {purchases.isPending ? (
        <LoadingState message="Cargando compras..." />
      ) : null}
      {purchases.isError ? (
        <div role="alert">
          <p>
            {isOnline
              ? 'No se pudieron cargar las compras.'
              : 'No hay compras guardadas disponibles sin conexión.'}
          </p>
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
        <EmptyState
          description={
            status || storeName
              ? 'Prueba con otro comercio o estado.'
              : 'Registra tu primera compra para relacionarla con el inventario.'
          }
          title={
            status || storeName
              ? 'No hay coincidencias'
              : 'No hay compras todavía'
          }
        >
          {!status && !storeName ? (
            <Link className="button button--secondary" to="/app/compras/nueva">
              Registrar compra
            </Link>
          ) : null}
        </EmptyState>
      ) : null}
      {items.length ? (
        <div aria-label="Compras registradas" className="purchase-list">
          <div aria-hidden="true" className="purchase-list__head">
            <span>Comercio</span>
            <span>Detalle</span>
            <span>Estado</span>
            <span>Total</span>
          </div>
          {items.map((purchase) => (
            <Link
              className="purchase-row"
              key={purchase.id}
              to={`/app/compras/${purchase.id}`}
            >
              <div className="purchase-row__identity">
                <h2>{purchase.storeName}</h2>
              </div>
              <div className="purchase-row__details">
                <p>
                  {formatDate(purchase.purchaseDate)} · {purchase.items.length}{' '}
                  producto{purchase.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <span
                className={`purchase-status purchase-status--${purchase.status.toLowerCase()}`}
              >
                {statusLabel(purchase.status)}
              </span>
              <strong className="purchase-row__total">
                {formatMoney(purchase.total, purchase.currency)}
              </strong>
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
