import { ReceiptText } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function PurchaseListHeader() {
  const households = useHouseholds();

  return (
    <PageHeader
      description="Consulta lo comprado y relaciona cada compra con tu inventario."
      eyebrow={households.activeHousehold?.name}
      icon={<ReceiptText size={22} />}
      title="Compras del hogar"
      titleId="purchase-list-title"
    />
  );
}
