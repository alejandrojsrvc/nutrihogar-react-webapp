import { ReceiptText } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { usePurchase } from '../hooks/usePurchases';

export function PurchaseDetailHeader() {
  const { purchaseId } = useParams();
  const purchase = usePurchase(purchaseId);
  const value = purchase.data;

  return (
    <PageHeader
      description={
        value
          ? `${formatDate(value.purchaseDate)} · ${formatMoney(value.total, value.currency)}`
          : undefined
      }
      eyebrow="Compra del hogar"
      icon={<ReceiptText size={22} />}
      title={value?.storeName ?? 'Detalle de compra'}
      titleId="purchase-detail-title"
    />
  );
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
