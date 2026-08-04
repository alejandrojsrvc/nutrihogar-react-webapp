import { CookingPot } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useWeeklyPlan } from '../hooks/useMealPlanning';

export function PlannedMealPreparationHeader() {
  const { weeklyPlanId, plannedMealId = '' } = useParams();
  const plan = useWeeklyPlan(weeklyPlanId);
  const meal = plan.data?.meals.find((item) => item.id === plannedMealId);

  return (
    <PageHeader
      description="El backend conserva participantes, cantidades y el estado del plan."
      eyebrow="Comida planificada"
      icon={<CookingPot size={22} />}
      title={`Cocinar ${meal?.name ?? 'receta'}`}
      titleId="planned-preparation-title"
    />
  );
}
