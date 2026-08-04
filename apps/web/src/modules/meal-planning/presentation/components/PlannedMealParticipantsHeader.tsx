import { Users } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import type { PlannedMeal } from '../../domain/MealPlanning';
import { useWeeklyPlan } from '../hooks/useMealPlanning';

export function PlannedMealParticipantsHeader() {
  const { weeklyPlanId, plannedMealId } = useParams();
  const plan = useWeeklyPlan(weeklyPlanId);
  const meal = plan.data?.meals.find((item) => item.id === plannedMealId);

  return (
    <PageHeader
      description="Selecciona los adultos que compartirán esta comida."
      eyebrow="Comida planificada"
      icon={<Users size={22} />}
      title={
        meal
          ? `Participantes de ${meal.name ?? mealLabel(meal)}`
          : 'Participantes de la comida'
      }
      titleId="participants-title"
    />
  );
}

function mealLabel(meal: PlannedMeal) {
  return (
    {
      BREAKFAST: 'desayuno',
      LUNCH: 'comida',
      DINNER: 'cena',
      SNACK: 'colación',
      EXTRA: 'comida',
    } as Record<string, string>
  )[meal.type];
}
