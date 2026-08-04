import { Scale } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { usePreparedBatch } from '../hooks/usePreparedBatches';

export function FinalizePreparedBatchHeader() {
  const { batchId } = useRouteParams();
  const batch = usePreparedBatch(batchId);
  const value = batch.data;

  if (value?.status === 'DRAFT') {
    return (
      <PageHeader
        eyebrow="Preparación"
        icon={<Scale size={22} />}
        title="Confirma los ingredientes"
      />
    );
  }

  if (value?.status === 'CANCELLED') {
    return (
      <PageHeader
        description="Esta preparación ya no puede finalizarse."
        eyebrow="Preparación cancelada"
        icon={<Scale size={22} />}
        title={value.recipeNameSnapshot}
      />
    );
  }

  if (value?.status === 'FINALIZED') {
    return (
      <PageHeader
        description="La nutrición se calculó con el peso cocido registrado."
        eyebrow="Preparación finalizada"
        icon={<Scale size={22} />}
        title={value.recipeNameSnapshot}
      />
    );
  }

  return (
    <PageHeader
      description="El peso cocido permite calcular la densidad nutricional real de esta preparación."
      eyebrow="Preparación confirmada"
      icon={<Scale size={22} />}
      title="Registrar peso cocido"
      titleId="finalize-title"
    />
  );
}
