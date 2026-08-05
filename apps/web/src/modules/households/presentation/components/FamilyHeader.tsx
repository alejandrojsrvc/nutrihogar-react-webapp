import { UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../hooks/useHouseholds';

export function FamilyHeader() {
  const households = useHouseholds();

  return (
    <PageHeader
      action={
        <Link className="button button--primary" to="/app/invitaciones">
          Invitar integrante
        </Link>
      }
      description="Consulta los integrantes del hogar y abre sus datos cuando lo necesites."
      eyebrow={households.activeHousehold?.name}
      icon={<UsersRound size={22} />}
      title="Familia"
      titleId="family-title"
    />
  );
}
