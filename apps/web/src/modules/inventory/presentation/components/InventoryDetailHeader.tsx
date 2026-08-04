import { PackageSearch } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useInventoryItem } from '../hooks/useInventory';

export function InventoryDetailHeader() {
  const { inventoryItemId } = useRouteParams();
  const item = useInventoryItem(inventoryItemId);

  return (
    <PageHeader
      description="Consulta el saldo disponible, sus alertas y el historial de cambios."
      eyebrow={item.data ? itemTypeLabel(item.data.itemType) : 'Inventario'}
      icon={<PackageSearch size={22} />}
      title={item.data?.name ?? 'Existencia'}
      titleId="inventory-detail-title"
    />
  );
}

function itemTypeLabel(type: string) {
  return type === 'PREPARED_FOOD'
    ? 'Preparación'
    : type === 'CUSTOM'
      ? 'Personalizado'
      : 'Alimento';
}
