import { Apple } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useFoodDetail } from '../hooks/useFoodCatalog';
import { formatReference } from '../utils/foodLabels';

export function FoodDetailHeader() {
  const { foodId } = useRouteParams();
  const foodDetail = useFoodDetail(foodId);

  if (
    !foodId ||
    foodDetail.isError ||
    foodDetail.isPending ||
    !foodDetail.data
  ) {
    return (
      <PageHeader
        icon={<Apple size={22} />}
        title="Detalle del alimento"
        titleId="food-detail-status-title"
      />
    );
  }

  const food = foodDetail.data;

  return (
    <PageHeader
      description={food.brand ?? `Valores por ${formatReference(food)}`}
      icon={<Apple size={22} />}
      title={food.name}
      titleId="food-detail-title"
    />
  );
}
