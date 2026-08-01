import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useCancelPurchase, useConfirmPurchase, usePurchase } from '../hooks/usePurchases';

export function PurchaseDetailPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const households = useHouseholds();
  const purchase = usePurchase(purchaseId);
  const confirm = useConfirmPurchase();
  const cancel = useCancelPurchase();

  if (households.isPending || purchase.isPending) return <p className="page-section" role="status">Cargando compra...</p>;
  if (households.isError || !households.activeHousehold || purchase.isError || !purchase.data) return <section className="page-section" role="alert"><p>No se pudo cargar la compra.</p><button className="button button--secondary" onClick={() => void purchase.refetch()} type="button">Reintentar</button></section>;

  const value = purchase.data;
  const editable = value.status === 'DRAFT';
  const error = confirm.error ?? cancel.error;
  return (
    <section className="page-section purchase-detail-page" aria-labelledby="purchase-detail-title">
      <BackButton fallback="/app/compras" />
      <p className="eyebrow">Compra del hogar</p>
      <h1 id="purchase-detail-title">{value.storeName}</h1>
      <p className="lead">{formatDate(value.purchaseDate)} · {formatMoney(value.total, value.currency)}</p>
      <div className="purchase-detail-actions"><span className="status-badge">{statusLabel(value.status)}</span>{editable ? <><Link className="button button--primary" to={`/app/compras/${value.id}/editar`}>Editar borrador</Link><button className="button button--secondary" disabled={confirm.isPending} onClick={() => confirm.mutate(value.id)} type="button">{confirm.isPending ? 'Confirmando...' : 'Confirmar compra'}</button><button className="button button--danger" disabled={cancel.isPending} onClick={() => { if (window.confirm('¿Cancelar este borrador?')) cancel.mutate(value.id, { onSuccess: () => navigate('/app/compras') }); }} type="button">Cancelar borrador</button></> : null}</div>
      {error ? <p className="form-field__error" role="alert">{error instanceof Error ? error.message : 'No se pudo actualizar la compra.'}</p> : null}
      <dl className="purchase-detail-meta"><div><dt>Comercio</dt><dd>{value.storeName}</dd></div><div><dt>Fecha</dt><dd>{formatDate(value.purchaseDate)}</dd></div><div><dt>Total</dt><dd>{formatMoney(value.total, value.currency)}</dd></div><div><dt>Moneda</dt><dd>{value.currency}</dd></div></dl>
      <section className="purchase-detail-section"><h2>Productos</h2>{value.items.length ? <ul className="purchase-item-list">{value.items.map((item) => <li key={item.id ?? `${item.nameSnapshot}-${item.quantity}`}><div><strong>{item.nameSnapshot}</strong><span>{item.quantity} {item.unit}</span></div>{item.inventoryItemId ? <Link to={`/app/inventario/${item.inventoryItemId}`}>Ver inventario</Link> : null}</li>)}</ul> : <p>Esta compra todavía no tiene productos.</p>}</section>
      {value.status === 'CONFIRMED' ? <p className="supporting-text">La confirmación de esta compra generó movimientos en el inventario.</p> : null}
    </section>
  );
}

function statusLabel(status: string) { return status === 'CONFIRMED' ? 'Confirmada' : status === 'CANCELLED' ? 'Cancelada' : 'Borrador'; }
function formatDate(value: string) { return value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Fecha no indicada'; }
function formatMoney(value: number, currency: string) { return new Intl.NumberFormat('es-AR', { currency, style: 'currency' }).format(value); }
