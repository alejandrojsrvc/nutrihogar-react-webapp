import { Utensils } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useMealDetails } from '../hooks/useMeals';

export function EditMealHeader() {
  const { mealId } = useRouteParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const detail = useMealDetails(mealId);

  if (
    households.isPending ||
    detail.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return <PageHeader icon={<Utensils size={22} />} title="Editar comida" />;
  }

  if (
    households.isError ||
    !households.activeHousehold ||
    detail.isError ||
    !detail.data ||
    profiles.isError
  ) {
    return (
      <PageHeader
        icon={<Utensils size={22} />}
        title="No pudimos abrir la edición"
        titleId="edit-meal-error-title"
      />
    );
  }

  if (
    detail.data.status !== 'CONFIRMED' ||
    detail.data.items.some((item) => item.foodId === null)
  ) {
    return (
      <PageHeader
        icon={<Utensils size={22} />}
        title="Edición no disponible"
        titleId="meal-edit-unavailable-title"
      />
    );
  }

  return (
    <PageHeader
      description="Ajusta los datos y revisa los alimentos antes de guardar."
      icon={<Utensils size={22} />}
      title="Editar comida"
      titleId="edit-meal-title"
    />
  );
}
