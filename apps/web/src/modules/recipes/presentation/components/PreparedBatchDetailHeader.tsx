import { CookingPot } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';
import { formatDateTime } from '../recipePresentation';

export function PreparedBatchDetailHeader() {
  const { batchId } = useParams();
  const details = usePreparedBatchDetails(batchId);
  const batch = details.data?.batch;

  return (
    <PageHeader
      description={
        batch ? `Preparada el ${formatDateTime(batch.preparedAt)}` : undefined
      }
      eyebrow="Preparación familiar"
      icon={<CookingPot size={22} />}
      title={batch?.recipeNameSnapshot ?? 'Preparación familiar'}
      titleId="prepared-batch-title"
    />
  );
}
