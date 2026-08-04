import { useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { Dialog } from '../../../../shared/presentation/components/Overlay';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  useCancelPurchase,
  useConfirmPurchase,
  usePurchaseConnectivity,
  usePurchase,
} from '../hooks/usePurchases';
import '../purchases.css';

export function PurchaseDetailPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const households = useHouseholds();
  const purchase = usePurchase(purchaseId);
  const confirm = useConfirmPurchase();
  const cancel = useCancelPurchase();
  const isOnline = usePurchaseConnectivity();
  const [confirmation, setConfirmation] = useState<'confirm' | 'cancel' | null>(
    null,
  );

  if (households.isPending || purchase.isPending)
    return (
      <p className="page-section" role="status">
        Cargando compra...
      </p>
    );
  if (
    households.isError ||
    !households.activeHousehold ||
    purchase.isError ||
    !purchase.data
  )
    return (
      <section className="page-section" role="alert">
        <p>
          {isOnline
            ? 'No se pudo cargar la compra.'
            : 'Esta compra no está disponible sin conexión.'}
        </p>
        <button
          className="button button--secondary"
          onClick={() =>
            void (households.isError || !households.activeHousehold
              ? households.refetch()
              : purchase.refetch())
          }
          type="button"
        >
          Reintentar
        </button>
      </section>
    );

  const value = purchase.data;
  const editable = value.status === 'DRAFT';
  const error = confirm.error ?? cancel.error;
  return (
    <section
      className="page-section purchase-detail-page"
      aria-labelledby="purchase-detail-title"
    >
      <BackButton fallback="/app/compras" />
      <PageHeader
        description={`${formatDate(value.purchaseDate)} · ${formatMoney(value.total, value.currency)}`}
        eyebrow="Compra del hogar"
        icon={<ReceiptText size={22} />}
        title={value.storeName}
        titleId="purchase-detail-title"
      />
      {!isOnline ? (
        <p className="feature-connectivity feature-connectivity--offline" role="status">
          Sin conexión. Puedes revisar esta compra, pero confirmarla, editarla o cancelarla requiere conexión.
        </p>
      ) : null}
      <div className="purchase-detail-actions">
        <span className="status-badge">{statusLabel(value.status)}</span>
        {editable ? (
          <>
            <button
              className="button button--primary"
              disabled={!isOnline || confirm.isPending}
              onClick={() => {
                confirm.reset();
                setConfirmation('confirm');
              }}
              type="button"
            >
              {confirm.isPending ? 'Confirmando...' : 'Confirmar compra'}
            </button>
            <Link
              aria-disabled={!isOnline}
              className="button button--secondary"
              onClick={(event) => {
                if (!isOnline) event.preventDefault();
              }}
              to={`/app/compras/${value.id}/editar`}
            >
              Editar borrador
            </Link>
            <button
              className="button button--text button--danger-text"
              disabled={!isOnline || cancel.isPending}
              onClick={() => {
                cancel.reset();
                setConfirmation('cancel');
              }}
              type="button"
            >
              Cancelar borrador
            </button>
          </>
        ) : null}
      </div>
      {error ? (
        <p className="form-field__error" role="alert">
          {error instanceof Error
            ? error.message
            : 'No se pudo actualizar la compra.'}
        </p>
      ) : null}
      <dl className="purchase-detail-meta">
        <div>
          <dt>Comercio</dt>
          <dd>{value.storeName}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{formatDate(value.purchaseDate)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatMoney(value.total, value.currency)}</dd>
        </div>
        <div>
          <dt>Moneda</dt>
          <dd>{value.currency}</dd>
        </div>
      </dl>
      <section className="purchase-detail-section">
        <div className="purchase-section-heading">
          <h2>Productos</h2>
          <span>{value.items.length} producto{value.items.length === 1 ? '' : 's'}</span>
        </div>
        {value.items.length ? (
          <ul className="purchase-item-list">
            {value.items.map((item) => (
              <li key={item.id ?? `${item.nameSnapshot}-${item.quantity}`}>
                <div>
                  <strong>{item.nameSnapshot}</strong>
                  <span>
                    {item.quantity} {unitLabel(item.unit)}
                  </span>
                </div>
                {item.inventoryItemId ? (
                  <Link to={`/app/inventario/${item.inventoryItemId}`}>
                    Ver inventario
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>Esta compra todavía no tiene productos.</p>
        )}
      </section>
      {value.status === 'CONFIRMED' ? (
        <p className="purchase-inventory-effect" role="status">
          Compra confirmada por el servidor. Los productos vinculados generaron movimientos y los saldos actuales se consultan en inventario.
        </p>
      ) : null}
      <Dialog
        onClose={() => setConfirmation(null)}
        open={confirmation === 'confirm'}
        title="Confirmar compra"
      >
        <div className="purchase-confirmation">
          <p>
            Al confirmar, el servidor registrará entradas para los productos vinculados y actualizará sus saldos de inventario.
          </p>
          <ul>
            {value.items.map((item) => (
              <li key={item.id ?? `${item.nameSnapshot}-${item.quantity}`}>
                <span>{item.nameSnapshot}</span>
                <strong>{item.quantity} {unitLabel(item.unit)}</strong>
              </li>
            ))}
          </ul>
          <p className="supporting-text">Esta acción no se guarda offline ni debe repetirse mientras está en curso.</p>
          {confirm.error ? (
            <p className="form-field__error" role="alert">
              {confirm.error instanceof Error ? confirm.error.message : 'No se pudo confirmar la compra.'}
            </p>
          ) : null}
          <div className="purchase-dialog-actions">
            <button className="button button--secondary" onClick={() => setConfirmation(null)} type="button">
              Seguir revisando
            </button>
            <button
              className="button button--primary"
              disabled={confirm.isPending}
              onClick={() =>
                confirm.mutate(value.id, { onSuccess: () => setConfirmation(null) })
              }
              type="button"
            >
              {confirm.isPending ? 'Confirmando...' : 'Confirmar y actualizar inventario'}
            </button>
          </div>
        </div>
      </Dialog>
      <Dialog
        onClose={() => setConfirmation(null)}
        open={confirmation === 'cancel'}
        title="Cancelar borrador"
      >
        <p>El borrador dejará de estar disponible para edición. El inventario no cambiará.</p>
        {cancel.error ? (
          <p className="form-field__error" role="alert">
            {cancel.error instanceof Error ? cancel.error.message : 'No se pudo cancelar el borrador.'}
          </p>
        ) : null}
        <div className="purchase-dialog-actions">
          <button className="button button--secondary" onClick={() => setConfirmation(null)} type="button">
            Conservar borrador
          </button>
          <button
            className="button button--danger"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(value.id, {
                onSuccess: () => navigate('/app/compras'),
              })
            }
            type="button"
          >
            {cancel.isPending ? 'Cancelando...' : 'Cancelar borrador'}
          </button>
        </div>
      </Dialog>
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
    ? new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Fecha no indicada';
}
function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-AR', { currency, style: 'currency' }).format(
    value,
  );
}

function unitLabel(unit: string) {
  return unit === 'GRAM'
    ? 'g'
    : unit === 'MILLILITER'
      ? 'ml'
      : unit === 'UNIT'
        ? 'unidad'
        : unit;
}
