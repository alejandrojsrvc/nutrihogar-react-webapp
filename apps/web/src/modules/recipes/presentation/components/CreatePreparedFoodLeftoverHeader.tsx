import { PackagePlus } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';

export function CreatePreparedFoodLeftoverHeader() {
  const { batchId } = useParams();
  const details = usePreparedBatchDetails(batchId);
  const status = details.data?.batch.status;

  if (status && status !== 'FINALIZED') {
    const cancelled = status === 'CANCELLED';

    return (
      <PageHeader
        description={
          cancelled
            ? 'No se pueden guardar sobrantes de una preparación cancelada.'
            : 'Registra el peso cocido antes de guardar un sobrante.'
        }
        eyebrow="Sobrante"
        icon={<PackagePlus size={22} />}
        title={
          cancelled
            ? 'Preparación cancelada'
            : 'La preparación todavía no está lista'
        }
      />
    );
  }

  return (
    <PageHeader
      description="Registra únicamente la cantidad que vas a guardar de esta preparación."
      eyebrow="Preparación familiar"
      icon={<PackagePlus size={22} />}
      title={
        details.data
          ? `Guardar sobrante de ${details.data.batch.recipeNameSnapshot}`
          : 'Guardar sobrante'
      }
      titleId="create-leftover-title"
    />
  );
}
