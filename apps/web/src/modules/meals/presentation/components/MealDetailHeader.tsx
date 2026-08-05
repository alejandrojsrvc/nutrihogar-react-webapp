import { Utensils } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useMealDetails } from '../hooks/useMeals';

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: 'Desayuno',
  DINNER: 'Cena',
  EXTRA: 'Extra',
  LUNCH: 'Almuerzo',
  SNACK: 'Merienda',
};

export function MealDetailHeader() {
  const { mealId } = useRouteParams();
  const details = useMealDetails(mealId);
  const meal = details.data;

  if (!meal) {
    return (
      <PageHeader
        eyebrow="Comida del día"
        icon={<Utensils size={22} />}
        title="Comida registrada"
        titleId="meal-detail-title"
      />
    );
  }

  return (
    <PageHeader
      eyebrow="Comida del día"
      icon={<Utensils size={22} />}
      title={mealTypeLabels[meal.mealType] ?? meal.mealType}
      titleId="meal-detail-title"
    />
  );
}
