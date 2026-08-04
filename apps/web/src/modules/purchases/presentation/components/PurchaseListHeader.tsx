import { ReceiptText } from 'lucide-react';
import { Link } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function PurchaseListHeader() {
  const households = useHouseholds();

  return (
    <PageHeader
      action={
        <Link className="button button--primary" to="/app/compras/nueva">
          Registrar compra
        </Link>
      }
      description="Consulta lo comprado y relaciona cada compra con tu inventario."
      eyebrow={households.activeHousehold?.name}
      icon={<ReceiptText size={22} />}
      title="Compras del hogar"
      titleId="purchase-list-title"
    />
  );
}
