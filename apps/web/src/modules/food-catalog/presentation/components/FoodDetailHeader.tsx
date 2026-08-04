import { Apple, Pencil } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useFoodDetail } from '../hooks/useFoodCatalog';
import { formatReference } from '../utils/foodLabels';

export function FoodDetailHeader() {
  const { foodId } = useParams<{ foodId: string }>();
  const households = useHouseholds();
  const foodDetail = useFoodDetail(foodId);

  if (!foodId || foodDetail.isError || foodDetail.isPending || !foodDetail.data) {
    return (
      <PageHeader
        icon={<Apple size={22} />}
        title="Detalle del alimento"
        titleId="food-detail-status-title"
      />
    );
  }

  const food = foodDetail.data;
  const canManage =
    food.foodType === 'CUSTOM' &&
    !food.isGlobal &&
    food.householdId === households.activeHousehold?.id;

  return (
    <PageHeader
      action={
        canManage ? (
          <Link
            aria-label="Editar alimento"
            className="button button--secondary"
            to={`/app/alimentos/${food.id}/editar`}
          >
            <Pencil aria-hidden="true" size={18} />
            Editar
          </Link>
        ) : undefined
      }
      description={food.brand ?? `Valores por ${formatReference(food)}`}
      icon={<Apple size={22} />}
      title={food.name}
      titleId="food-detail-title"
    />
  );
}
