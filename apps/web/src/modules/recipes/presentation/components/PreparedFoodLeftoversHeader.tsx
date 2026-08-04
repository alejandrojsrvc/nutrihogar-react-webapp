import { PackageOpen } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function PreparedFoodLeftoversHeader() {
  const households = useHouseholds();

  return (
    <PageHeader
      description="Preparaciones guardadas para consumir después."
      eyebrow={households.activeHousehold?.name}
      icon={<PackageOpen size={22} />}
      title="Sobrantes disponibles"
      titleId="leftovers-title"
    />
  );
}
