import { UsersRound } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../hooks/useHouseholds';

export function FamilyHeader() {
  const households = useHouseholds();

  return (
    <PageHeader
      description="Consulta los integrantes del hogar y abre sus datos cuando lo necesites."
      eyebrow={households.activeHousehold?.name}
      icon={<UsersRound size={24} />}
      title="Familia"
      titleId="family-title"
    />
  );
}
