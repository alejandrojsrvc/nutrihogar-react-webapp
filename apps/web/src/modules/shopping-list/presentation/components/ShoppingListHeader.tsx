import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function ShoppingListHeader() {
  const households = useHouseholds();

  return (
    <PageHeader
      action={
        <Link className="button button--secondary" to="/app/compras">
          Ver compras
        </Link>
      }
      description="Organiza lo pendiente sin confundir comprar con actualizar el inventario."
      eyebrow={households.activeHousehold?.name}
      icon={<ShoppingCart size={22} />}
      title="Lista de compras"
      titleId="shopping-list-title"
    />
  );
}
