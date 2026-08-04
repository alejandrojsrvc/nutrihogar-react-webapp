import { Repeat2 } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useMealDetails } from '../hooks/useMeals';

export function DuplicateMealHeader() {
  const { mealId } = useRouteParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const detail = useMealDetails(mealId);

  if (
    households.isPending ||
    detail.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  ) {
    return (
      <PageHeader icon={<Repeat2 size={22} />} title="Repetir comida" />
    );
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
        icon={<Repeat2 size={22} />}
        title="No pudimos preparar la repetición"
        titleId="duplicate-meal-error-title"
      />
    );
  }

  return (
    <PageHeader
      description="Revisa el destino. Los alimentos confirmados se copiarán sin modificar la comida original."
      icon={<Repeat2 size={22} />}
      title="Repetir comida"
      titleId="duplicate-meal-title"
    />
  );
}
