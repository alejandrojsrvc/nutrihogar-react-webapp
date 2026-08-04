import { Scale } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useInventoryItem } from '../hooks/useInventory';

export function InventoryAdjustHeader() {
  const { inventoryItemId } = useParams();
  const item = useInventoryItem(inventoryItemId);

  return (
    <PageHeader
      description="Registra el resultado de un conteo sin reemplazar el historial del inventario."
      eyebrow="Ajustar existencia"
      icon={<Scale size={22} />}
      title={item.data?.name ?? 'Ajustar existencia'}
      titleId="inventory-adjust-title"
    />
  );
}
