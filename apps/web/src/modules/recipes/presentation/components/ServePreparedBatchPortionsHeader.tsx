import { Users } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';

export function ServePreparedBatchPortionsHeader() {
  const { batchId } = useRouteParams();
  const details = usePreparedBatchDetails(batchId);
  const status = details.data?.batch.status;

  if (status && status !== 'FINALIZED') {
    const cancelled = status === 'CANCELLED';

    return (
      <PageHeader
        description={
          cancelled
            ? 'No se pueden servir porciones de una preparación cancelada.'
            : 'Completa los pasos pendientes antes de distribuir porciones.'
        }
        eyebrow="Porciones"
        icon={<Users size={22} />}
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
      description="Asigna cada cantidad a un integrante para conservar su seguimiento."
      eyebrow="Distribución familiar"
      icon={<Users size={22} />}
      title="Servir porciones"
      titleId="serve-portions-title"
    />
  );
}
