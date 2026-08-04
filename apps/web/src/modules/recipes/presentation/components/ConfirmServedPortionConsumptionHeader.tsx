import { UserCheck } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';

export function ConfirmServedPortionConsumptionHeader() {
  const { portionId = '' } = useRouteParams();
  const [params] = useSearchParams();
  const batchId = params.get('batchId') ?? '';
  const details = usePreparedBatchDetails(batchId || undefined);
  const portion = details.data?.servedPortions.find(
    (item) => item.id === portionId,
  );

  if (portion && portion.consumedWeight != null) {
    return (
      <PageHeader
        description={`Se registraron ${portion.consumedWeight} g consumidos. La confirmación no puede repetirse.`}
        eyebrow="Consumo confirmado"
        icon={<UserCheck size={22} />}
        title="Esta porción ya fue registrada"
      />
    );
  }

  return (
    <PageHeader
      description="Registra lo que quedó para calcular el consumo real sin estimaciones locales definitivas."
      eyebrow="Seguimiento de consumo"
      icon={<UserCheck size={22} />}
      title="Confirma lo consumido"
      titleId="confirm-consumption-title"
    />
  );
}
