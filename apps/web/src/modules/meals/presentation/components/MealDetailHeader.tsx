import { Pencil, Utensils } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useMealDetails } from '../hooks/useMeals';

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: 'Desayuno',
  DINNER: 'Cena',
  EXTRA: 'Extra',
  LUNCH: 'Almuerzo',
  SNACK: 'Merienda',
};

export function MealDetailHeader() {
  const { mealId } = useParams();
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

  const editDisabledReason = getEditDisabledReason(meal);

  return (
    <PageHeader
      action={
        editDisabledReason ? (
          <button
            aria-describedby="meal-edit-disabled-reason"
            className="button button--primary"
            disabled
            type="button"
          >
            <Pencil aria-hidden="true" size={18} />
            Editar comida
          </button>
        ) : (
          <Link
            className="button button--primary"
            to={`/app/comidas/${meal.id}/editar`}
          >
            <Pencil aria-hidden="true" size={18} />
            Editar comida
          </Link>
        )
      }
      eyebrow="Comida del día"
      icon={<Utensils size={22} />}
      title={mealTypeLabels[meal.mealType] ?? meal.mealType}
      titleId="meal-detail-title"
    />
  );
}

function getEditDisabledReason(
  meal: NonNullable<ReturnType<typeof useMealDetails>['data']>,
) {
  if (meal.status !== 'CONFIRMED') {
    return 'Las comidas canceladas se conservan como historial y no pueden modificarse.';
  }
  if (meal.items.some((item) => item.foodId === null)) {
    return 'Uno o más alimentos existen solo como una captura histórica. Para conservarlos sin cambios, esta comida no se puede editar.';
  }
  return null;
}
