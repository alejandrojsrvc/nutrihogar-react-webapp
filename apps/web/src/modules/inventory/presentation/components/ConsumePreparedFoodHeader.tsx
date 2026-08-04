import { Utensils } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useInventoryItem } from '../hooks/useInventory';

export function ConsumePreparedFoodHeader() {
  const { inventoryItemId } = useParams();
  const item = useInventoryItem(inventoryItemId);

  return (
    <PageHeader
      description="Este consumo actualizará el inventario y creará una comida con el origen de la preparación."
      eyebrow="Consumo de preparado"
      icon={<Utensils size={22} />}
      title={item.data?.name ?? 'Consumo de preparado'}
      titleId="consume-prepared-title"
    />
  );
}
