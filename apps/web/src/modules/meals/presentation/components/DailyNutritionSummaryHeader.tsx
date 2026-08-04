import { ChartNoAxesCombined, Plus } from 'lucide-react';
import { Link } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useActiveProfile } from '../../../../shared/presentation/providers/ActiveProfileContext';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function DailyNutritionSummaryHeader() {
  const { date = '' } = useRouteParams();
  const households = useHouseholds();
  const profilesQuery = useAdultProfiles(households.activeHousehold?.id);
  const { activeProfile, activeProfileId, profiles } = useActiveProfile();

  if (
    households.isPending ||
    (Boolean(households.activeHousehold) && profilesQuery.isPending)
  ) {
    return (
      <PageHeader
        icon={<ChartNoAxesCombined size={22} />}
        title="Resumen del día"
        titleId="daily-summary-title"
      />
    );
  }

  if (
    households.isError ||
    !households.activeHousehold ||
    profilesQuery.isError
  ) {
    return (
      <PageHeader
        icon={<ChartNoAxesCombined size={22} />}
        title="No pudimos abrir el resumen"
        titleId="summary-error-title"
      />
    );
  }

  if (profiles.length === 0 || !activeProfile) {
    return (
      <PageHeader
        eyebrow="Resumen diario"
        icon={<ChartNoAxesCombined size={22} />}
        title="Configura un adulto primero"
        titleId="summary-empty-profile-title"
      />
    );
  }

  return (
    <PageHeader
      action={
        <Link
          className="button button--primary"
          to={`/app/comidas/nueva?profileId=${activeProfileId}&date=${date}`}
        >
          <Plus aria-hidden="true" size={19} />
          Registrar comida
        </Link>
      }
      icon={<ChartNoAxesCombined size={22} />}
      title="Resumen del día"
      titleId="daily-summary-title"
    />
  );
}
