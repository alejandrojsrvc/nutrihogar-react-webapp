import { CalendarDays } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';

export function WeeklyPlanHeader() {
  return (
    <PageHeader
      description="Una vista sencilla de lo que quieren comer esta semana."
      eyebrow="Organización del hogar"
      icon={<CalendarDays size={22} />}
      title="Plan semanal"
      titleId="weekly-plan-title"
    />
  );
}
