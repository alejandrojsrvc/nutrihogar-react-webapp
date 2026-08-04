import { CalendarDays, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  canonicalWeekStart,
  isValidCalendarDate,
  todayInTimezone,
} from '../../domain/week';
import { useWeeklyPlanForWeek } from '../hooks/useMealPlanning';

export function WeeklyPlanHeader() {
  const households = useHouseholds();
  const [params] = useSearchParams();
  const timezone = households.activeHousehold?.timezone ?? 'UTC';
  const requestedDate = params.get('semana');
  const safeRequestedDate =
    requestedDate && isValidCalendarDate(requestedDate)
      ? requestedDate
      : todayInTimezone(timezone);
  const weekStart = canonicalWeekStart(safeRequestedDate);
  const plan = useWeeklyPlanForWeek(households.activeHousehold?.id, weekStart);

  return (
    <PageHeader
      action={
        plan.data ? (
          <Link
            className="button button--primary"
            to={`/app/plan-semanal/${plan.data.id}/comidas/nueva?fecha=${weekStart}&tipo=BREAKFAST`}
          >
            <Plus size={18} />
            Agregar comida
          </Link>
        ) : null
      }
      description="Una vista sencilla de lo que quieren comer esta semana."
      eyebrow="Organización del hogar"
      icon={<CalendarDays size={22} />}
      title="Plan semanal"
      titleId="weekly-plan-title"
    />
  );
}
