import { ShoppingCart } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function ShoppingListHeader() {
  const households = useHouseholds();

  return (
    <PageHeader
      description="Organiza lo pendiente sin confundir comprar con actualizar el inventario."
      eyebrow={households.activeHousehold?.name}
      icon={<ShoppingCart size={22} />}
      title="Lista de compras"
      titleId="shopping-list-title"
    />
  );
}
